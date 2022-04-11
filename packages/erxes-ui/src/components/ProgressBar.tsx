import { colors } from "../styles";
import { stripe } from "../utils/animations";
import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";

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
  height: ${(props) => (props.height ? props.height : "36px")};
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
  background: ${(props) => props.color};
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

const CircleContainer = styled.div`
  width: 150px;
  height: 150px;
  position: relative;
  `;
  const Circle = styled.circle`
    width: 150px;
    height: 150px;
    fill: none;
    stroke-width: 5;
    stroke: #000;
    transform: translate(5px, 5px);
    stroke-dasharray: 440;
    stroke-dashoffset: 440;
    stroke-linecap: round;

    &:nth-child(1) {
      stroke-dashoffset: 0;
      stroke: #f3f3f3;
    }

    &:nth-child(2) {
      stroke-dashoffset: calc(440 + (440 * 50) / 100);
      stroke: #03a9f4;
    }
`;

const Num = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  color: #111;

  h2 {
    font-size: 15;
  }
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
  color = "#dddeff",
  height,
  type,
}: Props) {
  if (type === "circle") {
    console.log("kolll");
    return (
      <CircleContainer>
        <CircleContainer>
          <Circle cx="70" cy="70" r="70"></Circle>
          <Circle cx="70" cy="70" r="70"></Circle>
        </CircleContainer>
        <Num>
          <h2>{percentage}</h2>
        </Num>
      </CircleContainer>
    );
  }
  console.log("jplll");
  return (
    <Wrapper height={height}>
      <Progress style={{ width: `${percentage}%` }} color={color} />
      <ContentContainer>{children}</ContentContainer>
      {close}
    </Wrapper>
  );
}

export default ProgressBar;
