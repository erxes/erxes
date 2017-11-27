import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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
  lblStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning'
  ])
};

Label.defaultProps = {
  lblStyle: 'default'
};

export default Label;
