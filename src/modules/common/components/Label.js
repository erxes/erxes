import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { colors, dimensions } from '../styles';

const shake = keyframes`
  0%{transform:rotate(-10deg)}
  28%{transform:rotate(10deg)}
  10%{transform:rotate(20deg)}
  18%{transform:rotate(-20deg)}
  28%{transform:rotate(20deg)}
  30%,100%{transform:rotate(0deg)}
`;

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

const LabelStyled = styled.span`
  border-radius: 14px;
  padding: 3px 9px;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: ${dimensions.unitSpacing - 1}px;
  display: inline-block;
  line-height: 1.32857143;
  background: ${props => types[props.lblStyle].background};
  color: ${colors.colorWhite};
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

  &.label-twitter {
    background: ${colors.socialTwitter};
  }

  &.label-facebook {
    background: ${colors.socialFacebook};
  }

  &.label-messenger {
    background: ${colors.colorPrimary};
  }
`;

function Label({ ...props }, { __ }) {
  return <LabelStyled {...props}>{__(props.children)}</LabelStyled>;
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  shake: PropTypes.bool,
  lblStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
    'simple'
  ])
};

Label.contextTypes = {
  __: PropTypes.func
};

Label.defaultProps = {
  lblStyle: 'default',
  shake: false
};

export default Label;
