import React from 'react';
import { cn } from 'erxes-ui';

interface CircularProgressBarProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  textColor?: string;
  progressColor?: string;
  trackColor?: string;
  className?: string;
}

export const CircularProgressBar: React.FC<
  Readonly<CircularProgressBarProps>
> = ({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  showText = true,
  textColor = 'text-foreground',
  progressColor = 'var(--primary)',
  trackColor = 'var(--muted)',
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            stroke={trackColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={progressColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
      </div>
      {showText && (
        <p className={`${textColor} text-[12px]`}>
          {value}/{max}
        </p>
      )}
    </div>
  );
};
