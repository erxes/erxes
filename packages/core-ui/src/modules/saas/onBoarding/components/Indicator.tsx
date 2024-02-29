import React from 'react';
import {
  Circle,
  CircleBackground,
  IndicatorText,
  ProgressBar,
} from 'modules/saas/onBoarding/styles';

type Props = {
  totalStep: number;
  activeStep: number;
};

function Indicator(props: Props) {
  const { totalStep, activeStep } = props;

  const strokeWidth = 2;
  const sqSize = 50;

  const radius = (sqSize - strokeWidth) / 2;

  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const percentage = (activeStep * 100) / totalStep;
  const dashArray = radius * totalStep * 4;
  const total = (146 / totalStep) * activeStep;
  const dashOffset = dashArray - total;

  return (
    <ProgressBar width={sqSize} height={sqSize} viewBox={viewBox}>
      <CircleBackground
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        activeStep={activeStep}
      />
      <Circle
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset }}
        activeStep={activeStep}
        totalStep={totalStep}
      />
      <IndicatorText x="50%" y="50%">
        {`${Math.floor(percentage)}%`}
      </IndicatorText>
    </ProgressBar>
  );
}

export default Indicator;
