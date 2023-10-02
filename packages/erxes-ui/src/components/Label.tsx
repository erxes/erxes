import { darken, rgba } from '../styles/ecolor';
import styled, { css } from 'styled-components';

import React from 'react';
import { __ } from '../utils/core';
import { shake as animationShake } from '../utils/animations';
import color from 'color';
import { colors } from '../styles';
import styledTS from 'styled-components-ts';

const types = {
  default: {
    color: colors.colorSecondary
  },
  primary: {
    color: colors.colorPrimaryDark
  },
  success: {
    color: colors.colorCoreGreen
  },
  danger: {
    color: colors.colorCoreRed
  },
  warning: {
    color: colors.colorCoreYellow
  },
  simple: {
    color: colors.colorCoreGray
  }
};

const LabelStyled = styledTS<{
  lblColor: string;
  isLightColor?: boolean;
  shake?: boolean;
}>(styled.span)`
  border-radius: 5px;
  padding: 3px 9px;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 8px;
  display: inline-block;
  line-height: 1.32857143;
  background: ${props =>
    props.isLightColor
      ? rgba(props.lblColor, 0.2)
      : rgba(props.lblColor, 0.15)};
  color: ${props =>
    props.isLightColor ? darken(props.lblColor, 50) : props.lblColor};
  border: none;
  font-weight: 600;
  animation: ${props =>
    props.shake ? `${animationShake} 3.5s ease infinite` : 'none'};

  ${props =>
    props.shake &&
    css`
      background: ${colors.colorCoreRed};
      color: ${colors.colorWhite};
    `};

  &:hover {
    cursor: default;
  }

  &.round {
    width: 15px;
    height: 15px;
    padding: 3px;
    line-height: 0.5;
    text-align: center;
    font-weight: normal;
  }
`;

type Props = {
  lblStyle?: string;
  lblColor?: string;
  children: React.ReactNode | string;
  className?: string;
  shake?: boolean;
  ignoreTrans?: boolean;
};

class Label extends React.Component<Props> {
  render() {
    const {
      ignoreTrans,
      children,
      lblColor,
      lblStyle = 'default',
      shake = false
    } = this.props;

    const updatedProps = {
      ...this.props,
      lblColor: lblColor ? lblColor : types[lblStyle].color,
      shake,
      isLightColor: lblColor
        ? color(lblColor).isLight()
        : color(types[lblStyle].color).isLight()
    };

    let content;

    if (ignoreTrans) {
      content = children;
    } else if (typeof children === 'string') {
      content = __(children);
    }

    return <LabelStyled {...updatedProps}>{content}</LabelStyled>;
  }
}

export default Label;
