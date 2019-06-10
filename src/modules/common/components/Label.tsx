import { __, colorParser } from 'modules/common/utils';
import { shake } from 'modules/common/utils/animations';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

const types = {
  default: {
    background: colors.colorSecondary
  },
  primary: {
    background: colors.colorPrimary
  },
  success: {
    background: colors.colorCoreGreen
  },
  danger: {
    background: colors.colorCoreRed
  },
  warning: {
    background: colors.colorCoreYellow
  },
  simple: {
    background: colors.colorCoreLightGray
  }
};

const LabelStyled = styledTS<{
  lblStyle: string;
  hasLightBackground?: boolean;
  shake?: boolean;
}>(styled.span)`
  border-radius: 14px;
  padding: 3px 9px;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 8px;
  display: inline-block;
  line-height: 1.32857143;
  background: ${props => types[props.lblStyle].background};
  color: ${props =>
    props.hasLightBackground ? colors.colorBlack : colors.colorWhite};
  border: none;
  animation: ${props => (props.shake ? `${shake} 3.5s ease infinite` : 'none')};

  &:hover {
    cursor: default;
  }

  &.round {
    width: 15px;
    height: 15px;
    padding: 3px;
    line-height: 0.5;
    text-align: center;
  }

  &.label-default {
    background: ${colors.colorPrimary};
  }

  &.label-form {
    background: ${colors.colorCoreYellow};
  }

  &.label-facebook {
    background: ${colors.socialFacebook};
  }

  &.label-messenger {
    background: ${colors.colorPrimary};
  }

  &.label-lead {
    background: ${colors.colorCoreBlue};
  }

  &.label-knowledgebase {
    background: ${colors.colorPrimary};
  }

  &.label-googleMeet {
    background: ${colors.socialGoogleMeet};
  }
`;

type Props = {
  children: React.ReactNode | string;
  className?: string;
  shake?: boolean;
  ignoreTrans?: boolean;
  style?: any;
  lblStyle?: string;
};

const defaultProps = {
  lblStyle: 'default',
  shake: false
};

class Label extends React.Component<Props> {
  render() {
    const { ignoreTrans, children, style } = this.props;

    const updatedProps = {
      ...this.props,
      hasLightBackground: style
        ? colorParser.isColorLight(style.backgroundColor || '')
        : undefined
    };

    let content;

    if (ignoreTrans) {
      content = children;
    } else if (typeof children === 'string') {
      content = __(children);
    }

    return (
      <LabelStyled {...defaultProps} {...updatedProps}>
        {content}
      </LabelStyled>
    );
  }
}

export default Label;
