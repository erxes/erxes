import { colors } from 'modules/common/styles';
import { stripe } from 'modules/common/utils/animations';
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

type Props = {
  children?: React.ReactNode;
  close?: React.ReactNode;
  percentage: number;
  color?: string;
  height?: string;
};

function ProgressBar({
  percentage,
  children,
  close,
  color = '#dddeff',
  height
}: Props) {
  return (
    <Wrapper height={height}>
      <Progress style={{ width: `${percentage}%` }} color={color} />
      <ContentContainer>{children}</ContentContainer>
      {close}
    </Wrapper>
  );
}

export default ProgressBar;
