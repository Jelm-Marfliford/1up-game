import React from 'react';
import { cn } from '../lib/utils';

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, current, max, color, className }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className={cn("w-full mb-4", className)}>
      <div className="flex justify-between items-end mb-1">
        <span className="font-pixel text-[10px] uppercase">{label}</span>
        <span className="font-mono text-lg">{current}/{max}</span>
      </div>
      <div className="h-6 w-full bg-gray-800 border-2 border-white p-0.5">
        <div 
          className={cn("h-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
