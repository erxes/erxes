import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components'
import { colors } from '../../styles';

const types = {
  default: {
    background: colors.colorPrimary,
  },
  primary: {
    background: colors.colorSecondary,
  },
  success: {
    background: colors.colorCoreGreen,
  },
  danger: {
    background: colors.colorCoreRed,
  },
  warning: {
    background: colors.colorCoreYellow,
  }
};

const LabelStyled = styled.span`
  border-radius: 14px;
  padding: 6px 12px;
  text-transform: uppercase;
  font-size: 9px;
  display: inline-block;
  background: ${props => types[props.lblStyle].background};
  color: ${colors.colorWhite};
  border: none;

  &:hover {
    cursor: default;
  }
`;

function Label({ lblStyle, children }) {
  return (
    <LabelStyled lblStyle={lblStyle}>
      {children}
    </LabelStyled>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  lblStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
  ])
};

Label.defaultProps = {
  lblStyle: 'default',
};

export default Label;
