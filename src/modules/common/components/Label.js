import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { colors, dimensions } from '../styles';

const shake = keyframes`
  0%{transform:rotate(-10deg)}
  28%{transform:rotate(10deg)}
  10%{transform:rotate(20deg)}
  18%{transform:rotate(-20deg)}
  28%{transform:rotate(20deg)}
  30%,100%{transform:rotate(0deg)}
`;

const types = {
  default: {
    background: colors.colorSecondary
  },
  primary: {
    background: colors.colorPrimary
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
    background: colors.colorCoreLightGray
  }
};

const LabelStyled = styled.span`
  border-radius: 14px;
  padding: 3px 9px;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: ${dimensions.unitSpacing - 1}px;
  display: inline-block;
  line-height: 1.32857143;
  background: ${props => types[props.lblStyle].background};
  color: ${props =>
    props.hasLightBackground ? colors.colorBlack : colors.colorWhite};
  border: none;
  animation: ${props => (props.shake ? `${shake} 3.5s ease infinite` : 'none')};

  &:hover {
    cursor: default;
  }

  &.round {
    width: 15px;
    height: 15px;
    padding: 3px;
    line-height: 0.5;
    text-align: center;
  }

  &.label-default {
    background: ${colors.colorPrimary};
  }

  &.label-form {
    background: ${colors.colorCoreYellow};
  }

  &.label-twitter {
    background: ${colors.socialTwitter};
  }

  &.label-facebook {
    background: ${colors.socialFacebook};
  }

  &.label-messenger {
    background: ${colors.colorPrimary};
  }
`;

function Label({ ...props }) {
  const hexToRgb = hex => {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  // returns black if color is light, if dark returns white
  const hasLightBackground = hex => {
    let luminance = 0;

    if (hex) {
      const rgb = hexToRgb(hex);
      const { r, g, b } = rgb;

      let C = [r / 255, g / 255, b / 255];

      for (var i = 0; i < C.length; ++i) {
        C[i] <= 0.03928
          ? (C[i] = C[i] / 12.92)
          : (C[i] = Math.pow((C[i] + 0.055) / 1.055, 2.4));
      }

      luminance = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2]; //luminance
    }

    return luminance > 0.179;
  };

  const updatedProps = {
    ...props,
    hasLightBackground: props.style
      ? hasLightBackground(props.style.backgroundColor)
      : null
  };

  return <LabelStyled {...updatedProps}>{props.children}</LabelStyled>;
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  shake: PropTypes.bool,
  style: PropTypes.object,
  lblStyle: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'danger',
    'warning',
    'simple'
  ])
};

Label.defaultProps = {
  lblStyle: 'default',
  shake: false
};

export default Label;
