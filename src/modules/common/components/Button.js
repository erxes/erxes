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
    borderColor: colors.colorShadowGray,
    color: colors.colorCoreLightGray
  },
  link: {
    background: 'transparent',
    color: colors.colorCoreGray
  }
};

const sizes = {
  large: {
    padding: '10px 30px',
    fontSize: '14px',
    lineHeight: '1.333333'
  },
  medium: {
    padding: '7px 20px',
    fontSize: '12px',
    lineHeight: '1.3'
  },
  small: {
    padding: '5px 15px',
    fontSize: '10px',
    lineHeight: '1.5'
  }
};

const ButtonStyled = styled.button`
  border-radius: 30px;
  position: relative;
  transition: all 0.3s ease;
  text-transform: uppercase;
  outline: 0;
  display: inline-block;
  color: ${colors.colorWhite};

  ${props => css`
    padding: ${sizes[props.size].padding};
    display: ${props.block && 'block'};
    width: ${props.block && '100%'};
    border: ${types[props.btnStyle].borderColor
      ? `1px solid ${colors.borderDarker}`
      : 'none'};
    background: ${types[props.btnStyle].background};
    color: ${types[props.btnStyle].color};
    font-size: ${sizes[props.size].fontSize};
    line-height: ${sizes[props.size].lineHeight};

    &:disabled {
      cursor: not-allowed !important;
      background: ${lighten(types[props.btnStyle].background, 30)};
      color: ${lighten(types[props.btnStyle].color, 20)};
    }

    &:hover {
      cursor: pointer;
      box-shadow: ${types[props.btnStyle] === types.link
        ? 'none'
        : `0 0 4px 0 ${colors.borderDarker}`};
      color: ${colors.colorWhite};
      color: ${types[props.btnStyle].color && darken(colors.colorCoreGray, 24)};
      text-decoration: none;
    }
  `};

  &.shrinked {
    padding: 8px 0;
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

const Link = ButtonStyled.withComponent('a');

const ButtonLink = Link.extend`
  text-decoration: inherit;
  text-align: center;
  pointer-events: ${props => props.disabled && 'none'};
  background: ${props =>
    props.disabled && lighten(types[props.btnStyle].background, 30)};
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
        <Icon erxes icon={props.icon} />
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
