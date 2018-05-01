import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Icon from './Icon';
import { colors } from '../styles';
import { darken, lighten } from '../styles/color';

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
  },
  simple: {
    background: colors.colorWhite,
    borderColor: colors.borderDarker,
    color: colors.colorCoreGray
  },
  link: {
    background: 'transparent',
    color: colors.colorCoreGray
  }
};

const sizes = {
  large: {
    padding: '10px 30px',
    fontSize: '13px'
  },
  medium: {
    padding: '7px 20px',
    fontSize: '12px'
  },
  small: {
    padding: '5px 15px',
    fontSize: '10px'
  }
};

const ButtonStyled = styled.button`
  border-radius: 30px;
  position: relative;
  transition: all 0.3s ease;
  text-transform: uppercase;
  outline: 0;

  ${props => css`
    padding: ${sizes[props.size].padding};
    background: ${types[props.btnStyle].background};
    font-size: ${sizes[props.size].fontSize};
    color: ${types[props.btnStyle].color
      ? types[props.btnStyle].color
      : colors.colorWhite};
    border: ${props.btnStyle === 'simple'
      ? `1px solid ${colors.borderDarker}`
      : 'none'};
    display: ${props.block && 'block'};
    width: ${props.block && '100%'};
    box-shadow: 0 2px 16px 0 ${lighten(types[props.btnStyle].background, 45)};

    &:hover {
      cursor: pointer;
      text-decoration: none;
      color: ${types[props.btnStyle].color
        ? darken(colors.colorCoreGray, 24)
        : colors.colorWhite};
      box-shadow: ${props.btnStyle !== 'link' &&
        `0 2px 15px 0 ${colors.darkShadow}`};
    }

    &:disabled {
      cursor: not-allowed !important;
      background: ${lighten(types[props.btnStyle].background, 30)};
      color: ${lighten(types[props.btnStyle].color, 20)};
    }
  `};

  a {
    color: ${colors.colorWhite};
  }

  & + button,
  + a,
  + span {
    margin-left: 10px;
  }

  > i + span,
  > span + i,
  > span i {
    margin-left: 5px;
  }
`;

const ButtonLink = ButtonStyled.withComponent('a').extend`
  text-decoration: inherit;
  text-align: center;
  
  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      background: lighten(types[props.btnStyle].background, 30);
    `};
`;

const ButtonGroup = styled.div`
  position: relative;
  display: inline-block;
  vertical-align: middle;

  button + a,
  a + button {
    margin-left: 10px;
  }
`;

function Button({ ...props }, { __ }) {
  const Element = props.href ? ButtonLink : ButtonStyled;

  let content = props.children;

  if (!props.ignoreTrans && typeof content === 'string' && __) {
    content = __(content);
  }

  if (props.icon) {
    return (
      <Element {...props}>
        <Icon icon={props.icon} />
        {content && <span>{content}</span>}
      </Element>
    );
  }

  return <Element {...props}>{content}</Element>;
}

function Group({ children }) {
  return <ButtonGroup>{children}</ButtonGroup>;
}

Button.Group = Group;

Group.propTypes = {
  children: PropTypes.node
};

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  href: PropTypes.string,
  type: PropTypes.string,
  btnStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
    'simple',
    'link'
  ]),
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  disabled: PropTypes.bool,
  ignoreTrans: PropTypes.bool,
  block: PropTypes.bool,
  icon: PropTypes.string
};

Button.contextTypes = {
  __: PropTypes.func
};

Button.defaultProps = {
  btnStyle: 'default',
  size: 'medium',
  block: false,
  type: 'button'
};

export default Button;
