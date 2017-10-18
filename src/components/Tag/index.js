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

const LabelStyled = styled.button`${props => css`
  border-radius: 1.875em;
  padding: 0.4em 0.8em;
  text-transform: uppercase;
  font-size: 0.6em;
  display: inline-block;
  background: ${types[props.nmStyle].background};
  color: ${colors.colorWhite};
  border: none;

  &:hover {
    cursor: default;
  }
`}`;

function Label({ nmStyle, children }) {
  return (
    <LabelStyled nmStyle={nmStyle}>
      {children}
    </LabelStyled>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  nmStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning'
  ])
};

Label.defaultProps = {
  nmStyle: 'default',
  children: 'Label',
};

export default Label;
