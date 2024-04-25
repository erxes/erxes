import React from "react";
import { __ } from "../utils/core";
import { colors } from "../styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";

const types = {
  default: {
    color: colors.colorSecondary,
  },
  primary: {
    color: colors.colorPrimary,
  },
  success: {
    color: colors.colorCoreGreen,
  },
  danger: {
    color: colors.colorCoreRed,
  },
  warning: {
    color: colors.colorCoreYellow,
  },
  simple: {
    color: colors.colorCoreLightGray,
  },
};

const Text = styledTS<{ $textStyle: string; hugeness: string }>(styled.span)`
  text-transform: uppercase;
  font-size: ${(props) => (props.hugeness !== "small" ? "14px" : "10px")};
  font-weight: bold;
  color: ${(props) => types[props.$textStyle || "default"].color}
`;

type Props = {
  children: React.ReactNode | string;
  ignoreTrans?: boolean;
  $textStyle?: string;
  hugeness?: string;
};

class TextInfo extends React.PureComponent<Props> {
  render() {
    const { ignoreTrans, children, $textStyle, hugeness } = this.props;

    let content;

    if (ignoreTrans) {
      content = children;
    } else if (typeof children === "string") {
      content = __(children);
    }

    const defaultProps = {
      $textStyle: $textStyle || "default",
      hugeness: hugeness || "small",
    };

    return <Text {...defaultProps}>{content}</Text>;
  }
}

export default TextInfo;
