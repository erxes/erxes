import * as React from 'react';

class CircularProgressBar extends React.Component<{
  sqSize?: number;
  strokeWidth?: number;
  percentage: number;
}> {
  render() {
    // Size of the enclosing square
    const sqSize = this.props.sqSize || 200;
    const strokeWidth = this.props.strokeWidth || 10;

    // SVG centers the stroke width on the radius, subtract out so circle fits in square
    const radius = (sqSize - strokeWidth) / 2;
    // Enclose cicle in a circumscribing square
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    // Arc length at 100% coverage is the circle circumference
    const dashArray = radius * Math.PI * 2;
    // Scale 100% coverage overlay with the actual percent
    const dashOffset =
      dashArray - (dashArray * Number(this.props.percentage)) / 100;

    return (
      <svg
        width={this.props.sqSize}
        height={this.props.sqSize}
        viewBox={viewBox}
      >
        <circle
          className="circle-background"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${this.props.strokeWidth}px`}
          style={{
            fill: 'none',
            stroke: '#ddd'
          }}
        />

        <circle
          className="circle-progress"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${this.props.strokeWidth}px`}
          // Start progress marker at 12 O'Clock
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            stroke: 'green',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            fill: 'none'
          }}
        />

        <text
          className="circle-text"
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
        >
          {`${this.props.percentage}%`}
        </text>
      </svg>
    );
  }
}

export default CircularProgressBar;
