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
  background: ${props => types[props.btnStyle].background};
  color: ${colors.colorWhite};
  border: none;

  &:hover {
    cursor: default;
  }
`;

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
    'warning',
  ])
};

Label.defaultProps = {
  btnStyle: 'default',
};

export default Label;
