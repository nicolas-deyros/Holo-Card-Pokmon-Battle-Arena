
import React, { useEffect, useState } from 'react';

interface PokeballProps {
  onAnimationEnd: () => void;
}

export const Pokeball: React.FC<PokeballProps> = ({ onAnimationEnd }) => {
  const [animationClass, setAnimationClass] = useState('animate-throw');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('animate-open');
    }, 1000); // Duration of the throw animation

    const endTimer = setTimeout(() => {
        onAnimationEnd();
    }, 1500); // Duration of throw + open animation

    return () => {
      clearTimeout(timer);
      clearTimeout(endTimer);
    };
  }, [onAnimationEnd]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <style>{`
        @keyframes pokeball-throw {
          0% { transform: translateY(100vh) rotate(-360deg) scale(0.5); opacity: 0; }
          50% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        @keyframes pokeball-open {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(0); opacity: 0; }
        }
        .animate-throw { animation: pokeball-throw 1s ease-out forwards; }
        .animate-open { animation: pokeball-open 0.5s ease-in forwards; }
      `}</style>
      <div className={`relative w-24 h-24 ${animationClass}`}>
        <div className="w-full h-1/2 bg-red-500 rounded-t-full border-4 border-black"></div>
        <div className="w-full h-1/2 bg-white rounded-b-full border-4 border-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-black flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full border-2 border-black"></div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-2 bg-black -translate-y-1/2"></div>
      </div>
    </div>
  );
};
