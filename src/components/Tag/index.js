import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import { colors } from '../../styles';

const types = {
  default: {
    background: colors.colorPrimary
  },
  primary: {
    background: colors.colorSecondary
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

const LabelStyled = styled.span`${props => css`
  border-radius: 1.875em;
  padding: 0.4em 0.8em;
  text-transform: uppercase;
  font-size: 0.6em;
  display: inline-block;
  background: ${types[props.btnStyle].background};
  color: ${colors.colorWhite};
  border: none;

  &:hover {
    cursor: default;
  }
`}`;

function Label({ btnStyle, children }) {
  return (
    <LabelStyled btnStyle={btnStyle}>
      {children}
    </LabelStyled>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  btnStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning'
  ])
};

Label.defaultProps = {
  btnStyle: 'default',
  children: 'Label',
};

export default Label;
