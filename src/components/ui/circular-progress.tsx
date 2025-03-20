import React from 'react';

export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  size = 300,
  strokeWidth = 6,
  showValue = false,
  className,
  color = '#3b82f6',
  bgColor = '#1f2937',
  children,
}: CircularProgressProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: `${size}px`, 
        height: `${size}px`,
        ...(className ? {} : {})
      }}
    >
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'rotate(-90deg)'
        }}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          style={{ 
            fill: 'none',
            stroke: bgColor 
          }}
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          style={{
            fill: 'none',
            transition: 'stroke-dashoffset 0.5s ease',
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            strokeLinecap: 'round',
          }}
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
        />
      </svg>
      {showValue && (
        <div style={{
          position: 'absolute',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          {Math.round(progress)}%
        </div>
      )}
      {children}
    </div>
  );
}
