import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import { colors } from '../../styles';
import { darken, lighten } from '../../utils/color';

const types = {
  default: {
    background: colors.colorPrimary,
    borderColor: colors.colorPrimary,
    color: colors.colorWhite,
    display: 'inline-block'
  },
  primary: {
    background: colors.colorSecondary,
    borderColor: colors.colorSecondary,
    color: colors.colorWhite,
  },
  success: {
    background: colors.colorCoreGreen,
    borderColor: colors.colorCoreGreen,
    color: colors.colorWhite,
  },
  danger: {
    background: colors.colorCoreRed,
    borderColor: colors.colorCoreRed,
    color: colors.colorWhite,
  },
  warning: {
    background: colors.colorCoreYellow,
    borderColor: colors.colorCoreYellow,
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
    borderColor: colors.colorWhite,
  },
  large: {
    padding: '0.5em 1.063em',
    fontSize: '1em'
  },
  medium: {
    padding: '0.438em 1em',
    fontSize: '0.75em'
  },
  small: {
    padding: '0.313em 0.75em',
    fontSize: '0.688em'
  },
  block: {
    width: '100%',
    display: 'block'
  }
};

const ButtonLink = styled.a`
  padding: '0.438em 1em';
  margin: 0 1em;
  color: ${colors.colorCoreGray};
  font-size: '0.75em';
  
  &:disabled {
    cursor: not-allowed !important;
    color:  ${lighten(colors.colorCoreLightGray, 20)} !important;
  }

  &:hover {
    cursor: pointer;
    color: ${darken(colors.colorCoreGray, 20)};
  }
`;

const ButtonStyled = styled.button`${props => css`
  border-radius: 1.875em;
  padding: ${types[props.size].padding};
  margin: 0 1em;
  display: ${types[props.label].display};
  width: ${types[props.label].width};
  border: 0.063em solid ${types[props.nmStyle].borderColor};
  background: ${types[props.nmStyle].background};
  color: ${types[props.nmStyle].color};
  font-size: ${types[props.size].fontSize};
  
  &:disabled {
    cursor: not-allowed !important;
    background: ${lighten(types[props.nmStyle].background, 30)} !important;
    border: 0.063em solid ${lighten(types[props.nmStyle].borderColor, 30)} !important;
    color:  ${lighten(types[props.nmStyle].color, 20)} !important;
  }

  &:hover {
    cursor: pointer;
    background: ${darken(types[props.nmStyle].background, 10)};
  }
`}`;

function Button({ nmStyle, children, size, disabled, label, href }) {
  return ( 
    <div>
    { (href) ?
      <ButtonLink disabled={disabled} href={href}
      >
        {children}
      </ButtonLink>
      :
      <ButtonStyled 
       nmStyle={nmStyle} size={size} disabled={disabled} label={label}
      >
      { children }
      </ButtonStyled>
    }
    </div>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  nmStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
    'simple',
    'link'
  ]),
  size: PropTypes.oneOf([
    'large',
    'medium',
    'small'
  ]),
  disabled: PropTypes.boolean,
  label: PropTypes.oneOf([
    'default',
    'block'
  ])
};

Button.defaultProps = {
  nmStyle: 'default',
  size: 'medium',
  children: 'Button',
  label: 'default'
};

export default Button;
