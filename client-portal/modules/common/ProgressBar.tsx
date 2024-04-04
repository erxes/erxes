import { colors } from '../styles';
import { stripe } from '../utils/animations';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ContentContainer = styled.div`
  position: relative;
  z-index: 3;
  color: ${colors.colorCoreDarkGray};
  text-align: center;
`;

const Wrapper = styledTS<{ height?: string }>(styled.div)`
  position: relative;
  padding: 0px 30px;
  background: ${colors.bgMain};
  width: 100%;
  height: ${props => (props.height ? props.height : '36px')};
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.05);

  a:hover {
    cursor: pointer;
  }

  > a {
    outline: none;
    top: 11px;
    right: 20px;
    position: absolute;
    font-size: 10px;
    color: ${colors.colorCoreGray};
  }
`;

const Progress = styledTS<{ color?: string }>(styled.div)`
  position: absolute;
  background: ${props => props.color};
  left: 0;
  top: 0;
  bottom: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%,
    transparent
  );
  background-size: 16px 16px;
  border-radius: 2px;
  transition: width 0.5s ease;
  animation: ${stripe} 1s linear infinite;
`;

const Container = styled.div`
  position: relative;
`;

const Circle = styled.circle`
  fill: transparent;
  stroke: hsla(225, 20%, 92%, 0.9);
  stroke-linecap: round;
`;

const FilledCircle: any = styledTS<{ color?: string }>(styled(Circle))`
  stroke: ${props => props.color};
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.5s ease-out;
`;

const Text = styledTS<{ color?: string }>(styled.div)`
  align-items: center;
  color: ${props => props.color};
  display: flex;
  font-weight: bold;
  height: 100%;
  justify-content: center;
  left: 0;
  letter-spacing: 0.025em;
  margin-bottom: 1rem;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 100;
`;

type Props = {
  children?: React.ReactNode;
  close?: React.ReactNode;
  percentage: number;
  color?: string;
  height?: string;
  type?: string;
};

function ProgressBar({
  percentage,
  children,
  close,
  color = '#dddeff',
  height,
  type
}: Props) {
  if (type === 'circle') {
    const strokeWidth = 3;
    const radius = 100 / 2 - strokeWidth * 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <Container>
        <svg
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percentage}
          height={height}
          role="progressbar"
          width={height}
          viewBox="0 0 100 100"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Circle cx="50" cy="50" r={radius} strokeWidth={strokeWidth} />

          <FilledCircle
            color={color}
            cx="50"
            cy="50"
            data-testid="progress-bar-bar"
            r={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeWidth={strokeWidth}
          />
        </svg>

        <Text color={color} data-testid="progress-bar-text">
          {percentage}%
        </Text>
      </Container>
    );
  }
  return (
    <Wrapper height={height}>
      <Progress style={{ width: `${percentage}%` }} color={color} />
      <ContentContainer>{children}</ContentContainer>
      {close}
    </Wrapper>
  );
}

export default ProgressBar;
