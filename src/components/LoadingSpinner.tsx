import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="relative w-20 h-20">
      <style>{`
        @keyframes pokeball-top {
          0%, 20% {
            transform: rotateX(0deg);
          }
          40%, 60% {
            transform: rotateX(-30deg);
          }
          80%, 100% {
            transform: rotateX(0deg);
          }
        }
        
        @keyframes pokeball-bottom {
          0%, 20% {
            transform: rotateX(0deg);
          }
          40%, 60% {
            transform: rotateX(30deg);
          }
          80%, 100% {
            transform: rotateX(0deg);
          }
        }
        
        @keyframes pokeball-button {
          0%, 20% {
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
            transform: translate(-50%, -50%) scale(1);
          }
          40%, 60% {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
            transform: translate(-50%, -50%) scale(1.1);
          }
          80%, 100% {
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes pokeball-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .pokeball-top {
          animation: pokeball-top 2s infinite ease-in-out;
          transform-origin: bottom center;
        }
        
        .pokeball-bottom {
          animation: pokeball-bottom 2s infinite ease-in-out;
          transform-origin: top center;
        }
        
        .pokeball-button {
          animation: pokeball-button 2s infinite ease-in-out;
        }
        
        .pokeball-container {
          animation: pokeball-float 3s infinite ease-in-out;
        }
      `}</style>

      {/* Pokeball container */}
      <div className="pokeball-container relative w-full h-full">
        {/* Top half */}
        <div className="pokeball-top absolute top-0 left-0 w-full h-1/2 bg-red-500 rounded-t-full border-4 border-black" />

        {/* Bottom half */}
        <div className="pokeball-bottom absolute bottom-0 left-0 w-full h-1/2 bg-white rounded-b-full border-4 border-black" />

        {/* Center line */}
        <div className="absolute top-1/2 left-0 w-full h-2 bg-black -translate-y-1/2 z-10" />

        {/* Center button */}
        <div className="pokeball-button absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full border-4 border-black flex items-center justify-center z-20">
          <div className="w-2 h-2 bg-white rounded-full border-2 border-black" />
        </div>
      </div>
    </div>
  </div>
);
