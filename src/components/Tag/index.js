import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import { colors } from '../../styles';
import { darken } from '../../utils/color';

const types = {
  default: {
    background: colors.colorPrimary,
    borderColor: darken(colors.colorPrimary, 10)
  },
  primary: {
    background: colors.colorSecondary,
    borderColor: darken(colors.colorSecondary, 10)
  },
  success: {
    background: colors.colorCoreGreen,
    borderColor: darken(colors.colorCoreGreen, 10)
  },
  danger: {
    background: colors.colorCoreRed,
    borderColor: darken(colors.colorCoreRed, 10)
  },
  warning: {
    background: colors.colorCoreYellow,
    borderColor: darken(colors.colorCoreYellow, 10)
  }
};

const LabelStyled = styled.button`${props => css`
  border-radius: 20px;
  margin: 0 1em;
  text-transform: uppercase;
  font-size: 0.6em;
  display: inline-block;
  background: ${types[props.styledType].background};
  color: ${colors.colorWhite};
  border: 1px solid ${types[props.styledType].borderColor};

  &:hover {
    cursor: default;
  }
`}`;

function Label({ styledType, children }) {
  return (
    <LabelStyled styledType={styledType}>
      {children}
    </LabelStyled>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  styledType: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning'
  ])
};

Label.defaultProps = {
  styledType: 'default',
  children: 'Label',
};

export default Label;
