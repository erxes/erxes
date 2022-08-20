import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { colors } from "../styles";

const ItemIndicator = styledTS<{ color: string }>(styled.span)`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin: 6px 6px 0 0;
  background-color: ${(props) => props.color};
  word-break:break-word;
  margin: 0 5px 0 0;
`;

const FullBackgrounded = styledTS<{ color: string }>(styled.span)`
  background-color: ${(props) => props.color};
  margin-left: 5px;
  padding: 5px 10px;
  border-radius: 300px;
  color: ${colors.colorWhite};
  font-weight: 450;
  font-size: 12px;
`;

type IProps = {
  value: string;
  isFullBackground?: boolean;
};

export default (props: IProps) => {
  const findColor = () => {
    switch (props.value) {
      case "Critical":
      case "Awareness":
        return colors.colorCoreRed;
      case "High":
      case "Acquisition":
        return colors.colorCoreYellow;
      case "Normal":
      case "Activation":
        return colors.colorCoreBlue;
      case "Revenue":
        return colors.colorCoreTeal;
      case "Retention":
        return colors.colorCoreGreen;

      default:
        return colors.colorCoreLightGray;
    }
  };

  if (props.isFullBackground) {
    return (
      <FullBackgrounded color={findColor()}>{props.value}</FullBackgrounded>
    );
  }

  return <ItemIndicator color={findColor()} />;
};
