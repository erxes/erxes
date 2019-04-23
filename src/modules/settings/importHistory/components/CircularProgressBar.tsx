import * as React from 'react';

class CircularProgressBar extends React.Component<{
  sqSize?: number;
  strokeWidth?: number;
  percentage: number;
}> {
  renderText = text => {
    return (
      <text
        className="circle-text"
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
      >
        {text}
      </text>
    );
  };

  renderPercentage = () => {
    const { percentage } = this.props;

    if (percentage === 0) {
      return (
        <React.Fragment>
          {this.renderText(`Please wait while we are processing your data`)}
          <svg
            className="svg-spinner"
            viewBox="0 0 50 50"
            x="48%"
            y="53%"
            width={30}
            height={30}
          >
            <circle
              className="svg-spinner-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="5"
            />
          </svg>
        </React.Fragment>
      );
    }

    return this.renderText(`${percentage}%`);
  };

  render() {
    const sqSize = this.props.sqSize || 200;
    const strokeWidth = this.props.strokeWidth || 10;

    const radius = (sqSize - strokeWidth) / 2;
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
        {this.renderPercentage()};
      </svg>
    );
  }
}

export default CircularProgressBar;
