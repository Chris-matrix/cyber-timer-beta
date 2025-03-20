import React from 'react';
import { cn } from '../../lib/utils';

export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
  color?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  size = 300,
  strokeWidth = 6,
  showValue = false,
  className,
  color = 'text-blue-500',
  children,
}: CircularProgressProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        className="absolute w-full h-full -rotate-90 transform"
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          className="fill-none stroke-white/10"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            stroke: color
          }}
          className="fill-none transition-all duration-300"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        {children}
        {showValue && (
          <span className="text-2xl font-semibold">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
}
