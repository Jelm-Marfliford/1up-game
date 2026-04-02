import React from 'react';
import { motion } from 'motion/react';
import { UserStats } from '../types';

interface AvatarProps {
  stats: UserStats;
}

export const Avatar: React.FC<AvatarProps> = ({ stats }) => {
  const isHealthy = stats.hp > 70 && stats.san > 70;
  const isCrispy = stats.hp < 30;
  const isInsane = stats.san < 30;

  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      {/* Simple Pixel Avatar using CSS/Divs or SVG */}
      <motion.div 
        animate={{ 
          y: [0, -5, 0],
          scale: isInsane ? [1, 1.05, 0.95, 1] : 1
        }}
        transition={{ 
          repeat: Infinity, 
          duration: isCrispy ? 3 : 2,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Head */}
        <div className={`w-32 h-32 border-4 border-white ${isCrispy ? 'bg-gray-600' : 'bg-retro-yellow'} relative`}>
          {/* Eyes */}
          <div className="absolute top-8 left-6 flex gap-8">
            <div className="w-4 h-4 bg-black relative">
              {isCrispy && <div className="absolute -bottom-2 w-6 h-1 bg-purple-900/50 -left-1" />}
            </div>
            <div className="w-4 h-4 bg-black relative">
              {isCrispy && <div className="absolute -bottom-2 w-6 h-1 bg-purple-900/50 -left-1" />}
            </div>
          </div>
          
          {/* Mouth */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            {isHealthy ? (
              <div className="w-8 h-2 bg-black" />
            ) : (
              <div className="w-8 h-1 bg-black" />
            )}
          </div>

          {/* Insanity Swirls */}
          {isInsane && (
            <div className="absolute -top-4 -right-4 text-retro-red font-pixel text-xs animate-pulse">
              ?!
            </div>
          )}
        </div>
        
        {/* Body */}
        <div className="w-24 h-12 border-4 border-t-0 border-white bg-retro-blue mx-auto" />
      </motion.div>

      {/* Glow effect */}
      {isHealthy && (
        <div className="absolute inset-0 bg-retro-green/10 blur-2xl rounded-full -z-10 animate-pulse" />
      )}
    </div>
  );
};
