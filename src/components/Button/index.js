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
  },
  block: {
    width: '100%',
    display: 'block',
  },
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

const ButtonLink = styled.a`${props => css`
  border-radius: 1.875em;
  padding: ${sizes[props.size].padding};
  margin: 0 1em;
  display: ${types[props.label].display};
  width: ${types[props.label].width};
  border: ${types[props.btnStyle].borderColor ? '0.063em solid': 'none'};
  background: ${types[props.btnStyle].background};
  color: ${types[props.btnStyle].color};
  font-size: ${sizes[props.size].fontSize};
  text-decoration: inherit;
  text-transform: uppercase;
  
  &:disabled {
    cursor: not-allowed !important;
    background: ${lighten(types[props.btnStyle].background, 30)} !important;
    color:  ${lighten(types[props.btnStyle].color, 20)} !important;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 0.25em 0 ${colors.colorCoreGray};
    color: ${types[props.btnStyle].color !== colors.colorWhite 
      ? darken(colors.colorCoreGray, 24) 
      : ''};
  }
`}`;

const ButtonStyled = styled.button`${props => css`
  border-radius: 1.875em;
  padding: ${sizes[props.size].padding};
  margin: 0 1em;
  display: ${types[props.label].display};
  width: ${types[props.label].width};
  border: ${types[props.btnStyle].borderColor ? '0.063em solid': 'none'};
  background: ${types[props.btnStyle].background};
  color: ${types[props.btnStyle].color};
  font-size: ${sizes[props.size].fontSize};
  text-transform: uppercase;
  
  &:disabled {
    cursor: not-allowed !important;
    background: ${lighten(types[props.btnStyle].background, 30)} !important;
    color:  ${lighten(types[props.btnStyle].color, 20)} !important;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 0.25em 0 ${colors.colorCoreGray};
    color: ${types[props.btnStyle].color !== colors.colorWhite 
      ? darken(colors.colorCoreGray, 24) 
      : ''};
  }
`}`;

function Button({ btnStyle, children, size, disabled, label, href, onClick }) {
  return ( 
    <div>
    { href ?
        <ButtonLink 
          href={href} btnStyle={btnStyle} size={size} label={label} disabled={disabled} onClick={onClick}
        >
          {children}
        </ButtonLink>
        :
        <ButtonStyled 
         btnStyle={btnStyle} size={size} label={label} disabled={disabled} onClick={onClick}
        >
          { children }
        </ButtonStyled>
    }
    </div>
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
  label: PropTypes.oneOf([
    'default',
    'block',
  ])
};

Button.defaultProps = {
  btnStyle: 'default',
  size: 'medium',
  children: 'Button',
  label: 'default',
};

export default Button;
