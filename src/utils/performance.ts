import { useRef, useCallback, useEffect, useState } from 'react';

// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  endTiming(label: string): number {
    if (typeof performance === 'undefined') return 0;

    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const measure = performance.getEntriesByName(label, 'measure')[0];
    const duration = measure?.duration || 0;

    // Store the metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);

    // Clean up marks and measures
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);

    return duration;
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { avg: number; count: number; latest: number }> {
    const result: Record<string, { avg: number; count: number; latest: number }> = {};

    this.metrics.forEach((times, label) => {
      result[label] = {
        avg: this.getAverageTime(label),
        count: times.length,
        latest: times[times.length - 1] || 0,
      };
    });

    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(
  componentName: string,
  enabled = process.env.NODE_ENV === 'development'
) {
  const monitor = PerformanceMonitor.getInstance();
  const renderCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current++;
    const label = `${componentName}-render-${renderCount.current}`;

    monitor.startTiming(label);

    return () => {
      monitor.endTiming(label);
    };
  });

  return useCallback(() => {
    if (!enabled) return {};
    return monitor.getMetrics();
  }, [enabled, monitor]);
}

/**
 * Hook for throttling expensive operations
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastRun.current = Date.now();
            callback(...args);
          },
          delay - (now - lastRun.current)
        );
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Memory usage monitoring (if available)
 */
export function getMemoryUsage(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (
      performance as unknown as {
        memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }
    ).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return {};
}

/**
 * FPS monitoring utility
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isRunning = false;
  private animationId: number | null = null;

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.measure();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getFPS(): number {
    return this.fps;
  }

  private measure = (): void => {
    if (!this.isRunning) return;

    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.measure);
  };
}

/**
 * Hook for FPS monitoring
 */
export function useFPSMonitor(): {
  fps: number;
  isMonitoring: boolean;
  toggle: () => void;
} {
  const [fps, setFPS] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitorRef = useRef<FPSMonitor | null>(null);

  useEffect(() => {
    monitorRef.current = new FPSMonitor();

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isMonitoring || !monitorRef.current) return;

    monitorRef.current.start();

    const interval = setInterval(() => {
      if (monitorRef.current) {
        setFPS(monitorRef.current.getFPS());
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (monitorRef.current) {
        monitorRef.current.stop();
      }
    };
  }, [isMonitoring]);

  const toggle = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  return { fps, isMonitoring, toggle };
}
