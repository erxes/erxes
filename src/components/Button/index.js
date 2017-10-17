import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import { colors } from '../../styles';
import { darken, lighten } from '../../utils/color';
// import { Icon } from '../Icon';

const types = {
  default: {
    background: colors.colorPrimary,
    borderColor: darken(colors.colorPrimary, 10),
    color: colors.colorWhite,
    display: 'inline-block'
  },
  primary: {
    background: colors.colorSecondary,
    borderColor: darken(colors.colorSecondary, 10),
    color: colors.colorWhite,
  },
  success: {
    background: colors.colorCoreGreen,
    borderColor: darken(colors.colorCoreGreen, 10),
    color: colors.colorWhite,
  },
  danger: {
    background: colors.colorCoreRed,
    borderColor: darken(colors.colorCoreRed, 10),
    color: colors.colorWhite,
  },
  warning: {
    background: colors.colorCoreYellow,
    borderColor: darken(colors.colorCoreYellow, 10),
    color: colors.colorWhite,
  },
  simple: {
    background: colors.colorWhite,
    borderColor: darken(colors.bgLight, 10),
    color: colors.colorCoreLightGray,
  },
  large: {
    padding: '0.5em 1em',
    fontSize: '1.125em'
  },
  medium: {
    padding: '0.375em 0.75em',
    fontSize: '0.813em'
  },
  small: {
    padding: '0.313em 0.625em',
    fontSize: '0.75em'
  },
  xsmall: {
    padding: '0.188em 0.375em',
    fontSize: '0.688em'
  },
  block: {
    width: '100%',
    display: 'block'
  }
};

const ButtonStyled = styled.button`${props => css`
  border-radius: 20px;
  padding: ${types[props.size].padding};
  margin: 0 1em;
  display: ${types[props.block].display};
  width: ${types[props.block].width};
  background: ${types[props.styledType].background};
  color: ${types[props.styledType].color};
  font-size: ${types[props.size].fontSize};
  border: 1px solid ${types[props.styledType].borderColor};
  
  &:disabled {
    cursor: not-allowed !important;
    background: ${lighten(types[props.styledType].background, 40)} !important;
    border: 1px solid ${lighten(types[props.styledType].borderColor, 40)} !important;
  }

  &:hover {
    cursor: pointer;
    background: ${darken(types[props.styledType].background, 10)};
  }
`}`;

function Button({ styledType, children, onClick, size, disabled, block, href }) {
  return (
    <a href={href}>
      <ButtonStyled styledType={styledType} onClick={onClick} size={size} disabled={disabled} block={block}>
        {children}
      </ButtonStyled>
    </a>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  href: PropTypes.href,
  styledType: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
    'simple'
  ]),
  size: PropTypes.oneOf([
    'large',
    'medium',
    'small',
    'xsmall'
  ]),
  disabled: PropTypes.func,
  block: PropTypes.oneOf([
    'default',
    'block'
  ])
};

Button.defaultProps = {
  styledType: 'default',
  size: 'medium',
  children: 'Button',
  block: 'default',
  href: '#',
};

export default Button;
