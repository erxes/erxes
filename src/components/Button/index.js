import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import { colors } from '../../styles';
import { darken, lighten } from '../../utils/color';

const types = {
  default: {
    background: colors.colorPrimary,
    color: colors.colorWhite,
    display: 'inline-block',
  },
  primary: {
    background: colors.colorSecondary,
    color: colors.colorWhite,
  },
  success: {
    background: colors.colorCoreGreen,
    color: colors.colorWhite,
  },
  danger: {
    background: colors.colorCoreRed,
    color: colors.colorWhite,
  },
  warning: {
    background: colors.colorCoreYellow,
    color: colors.colorWhite,
  },
  simple: {
    background: colors.colorWhite,
    borderColor: colors.colorCoreLightGray,
    color: colors.colorCoreLightGray,
  },
  link: {
    background: 'transparent',
    color: colors.colorCoreGray,
  }
};

const sizes = {
  large: {
    padding: '0.688em 2.063em',
    fontSize: '0.875em',
  },
  medium: {
    padding: '0.665em 2em',
    fontSize: '0.688em',
  },
  small: {
    padding: '0.5em 1.375em',
    fontSize: '0.625em',
  },
};

const ButtonStyled = styled.button`${props => css`
  border-radius: 1.875em;
  padding: ${sizes[props.size].padding};
  margin: 0 1em;
  display: ${props.block ? 'block' : 'inline-block'};
  width: ${props.block && '100%'};
  border: ${types[props.btnStyle].borderColor ? '0.063em solid': 'none'};
  background: ${types[props.btnStyle].background};
  color: ${types[props.btnStyle].color};
  font-size: ${sizes[props.size].fontSize};
  transition: all 0.5s ease;
  text-transform: uppercase;

  &:disabled {
    cursor: not-allowed !important;
    background: ${lighten(types[props.btnStyle].background, 30)};
    color:  ${lighten(types[props.btnStyle].color, 20)};
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 0.25em 0 ${colors.colorCoreGray};
    color: ${types[props.btnStyle].color !== colors.colorWhite 
      ? darken(colors.colorCoreGray, 24) 
      : ''};
  }
`}`;

const Link = ButtonStyled.withComponent('a');

const ButtonLink = Link.extend`
  text-decoration: inherit;
  text-align: center;
  background: ${props => props.disabled ? lighten(types[props.btnStyle].background, 30) : ''};
  pointer-events: none;
`;

function Button({ btnStyle, children, size, disabled, block, href, onClick }) {

  if (href) {
    return (
      <ButtonLink
        href={href} 
        btnStyle={btnStyle}
        size={size} 
        block={block} 
        disabled={disabled} 
        onClick={onClick}
        >
        { children }
      </ButtonLink>
    )
  }

    return ( 
      <ButtonStyled 
        btnStyle={btnStyle} 
        size={size} 
        block={block} 
        disabled={disabled} 
        onClick={onClick}
        >
        { children }
      </ButtonStyled>
    );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  href: PropTypes.string,
  btnStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
    'simple',
    'link',
  ]),
  size: PropTypes.oneOf([
    'large',
    'medium',
    'small',
  ]),
  disabled: PropTypes.bool,
  block: PropTypes.bool,
};

Button.defaultProps = {
  btnStyle: 'default',
  size: 'medium',
  children: 'Button',
  label: 'default',
};

export default Button;
