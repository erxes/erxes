import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { colors } from '../styles';

const shake = keyframes`
  0%{transform:rotate(-7deg)}
  28%{transform:rotate(7deg)}
  10%{transform:rotate(15deg)}
  18%{transform:rotate(-15deg)}
  28%{transform:rotate(15deg)}
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
  }
};

const LabelStyled = styled.span`
  border-radius: 14px;
  padding: 3px 9px;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 9px;
  display: inline-block;
  line-height: 1.32857143;
  background: ${props => types[props.lblStyle].background};
  color: ${colors.colorWhite};
  border: none;
  animation: ${props => (props.shake ? `${shake} 3.5s ease infinite` : 'none')};

  &:hover {
    cursor: default;
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
`;

function Label({ ...props }) {
  return <LabelStyled {...props}>{props.children}</LabelStyled>;
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
    'warning'
  ])
};

Label.defaultProps = {
  lblStyle: 'default',
  shake: false
};

export default Label;
