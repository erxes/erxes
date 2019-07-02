import { __ } from 'modules/common/utils';
import React from 'react';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';
import { darken, lighten } from '../styles/color';
import Icon from './Icon';

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

const ButtonStyled = styledTS<{
  hugeness: string;
  btnStyle: string;
  block?: boolean;
}>(styled.button)`
  border-radius: 30px;
  position: relative;
  transition: all 0.3s ease;
  text-transform: uppercase;
  outline: 0;

  ${props => css`
    padding: ${sizes[props.hugeness].padding};
    background: ${types[props.btnStyle].background};
    font-size: ${sizes[props.hugeness].fontSize};
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
        `0 2px 22px 0 ${lighten(types[props.btnStyle].background, 25)}`};
    }

    &:disabled {
      cursor: not-allowed !important;
      opacity: 0.75;
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

const ButtonLink = styledTS<{ disabled?: boolean }>(
  styled(ButtonStyled.withComponent('a'))
)`
  text-decoration: inherit;
  text-align: center;
  
  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed !important;
      opacity: 0.75;

      &:focus {
        text-decoration: none;
      }
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

type ButtonProps = {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  type?: string;
  btnStyle?: string;
  size?: string;
  disabled?: boolean;
  ignoreTrans?: boolean;
  block?: boolean;
  icon?: string;
  style?: any;
  id?: string;
};

export default class Button extends React.Component<ButtonProps> {
  static Group = Group;

  static defaultProps = {
    btnStyle: 'default',
    size: 'medium',
    block: false,
    type: 'button'
  };

  render() {
    const { size, ...sizeExcluded } = this.props;
    const { href, children, ignoreTrans, icon } = sizeExcluded;
    const props = { ...sizeExcluded, hugeness: size };

    const Element = href ? ButtonLink : ButtonStyled;

    let content = children;

    if (!ignoreTrans && typeof content === 'string' && __) {
      content = __(content);
    }

    if (icon) {
      return (
        <Element {...props}>
          <Icon icon={icon} />
          {content && <span>{content}</span>}
        </Element>
      );
    }

    return <Element {...props}>{content}</Element>;
  }
}

function Group({ children }: { children: React.ReactNode }) {
  return <ButtonGroup>{children}</ButtonGroup>;
}
