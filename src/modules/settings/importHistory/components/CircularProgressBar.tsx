import * as React from 'react';

type Props = {
  sqSize?: number;
  strokeWidth?: number;
  percentage: number;
};

function CircularProgressBar({ sqSize, strokeWidth, percentage }: Props) {
  const renderText = value => {
    if (value === 100) {
      return (
        <path
          className="checkmark"
          fill="none"
          stroke="#2cab28"
          strokeWidth="2"
          d="M12 20.2l5.1 6.2 12.7-12.8"
        />
      );
    }

    return (
      <text x="50%" y="50%" dy=".3em" textAnchor="middle">
        {value}%
      </text>
    );
  };

  const renderPercentage = () => {
    if (percentage === 0) {
      return (
        <>
          {renderText(0)}
          <svg viewBox="0 0 50 50" x="0" y="0" width={40} height={40}>
            <circle
              className="svg-spinner-path"
              cx="25"
              cy="25"
              r="24"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </>
      );
    }

    return renderText(percentage);
  };

  const circleSize = sqSize || 100;
  const borderWidth = strokeWidth || 5;

  const radius = (circleSize - borderWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2;
  // Scale 100% coverage overlay with the actual percent
  const dashOffset = dashArray - (dashArray * Number(percentage)) / 100;

  return (
    <svg width={sqSize} height={sqSize} viewBox={viewBox}>
      <circle
        className="circle-background"
        cx={circleSize / 2}
        cy={circleSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        style={{
          fill: 'none',
          stroke: '#eee'
        }}
      />
      <circle
        className="circle-progress"
        cx={circleSize / 2}
        cy={circleSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        // Start progress marker at 12 O'Clock
        transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset,
          stroke: `${percentage === 100 ? '#3CCC38' : '#6569DF'}`,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none'
        }}
      />
      {renderPercentage()};
    </svg>
  );
}

export default CircularProgressBar;
