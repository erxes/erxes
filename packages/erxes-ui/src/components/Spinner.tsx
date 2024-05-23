import React from "react";
import { colors } from "../styles";
import { rotate } from "../utils/animations";
import styled from "styled-components";
import styledTS from "styled-components-ts";

type Props = {
  objective?: boolean;
  size?: number;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  height?: string;
};

const Spin = styledTS<{ $objective?: boolean; height?: string }>(styled.div)`
  height: ${(props) => props.$objective && (props.height ? props.height : "100%")};
  position: ${(props) => props.$objective && "relative"};
`;

export const MainLoader = styledTS<Props>(styled.div)`
  position: absolute;
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  top: ${(props) => props.top};
  bottom: ${(props) => props.bottom};
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  margin-left: -${(props) => props.size}px;
  margin-top: -${(props) => props.size && props.size / 2}px;
  animation: ${rotate} 0.75s linear infinite;
  border: 2px solid ${colors.borderDarker};
  border-top-color: ${colors.colorSecondary};
  border-right-color: ${colors.colorSecondary};
  border-radius: 100%;
`;

function Spinner({
  objective = false,
  size = 26,
  top = "50%",
  bottom = "auto",
  left = "50%",
  right = "auto",
  height,
}: Props) {
  return (
    <Spin $objective={objective} height={height}>
      <MainLoader
        size={size}
        top={top}
        bottom={bottom}
        right={right}
        left={left}
      />
    </Spin>
  );
}

export default Spinner;
