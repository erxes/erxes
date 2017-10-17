import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components"
import { colors } from "../../styles";
import { darken } from "../../utils/color";


const types = {
  default: {
    background: colors.colorPrimary,
    borderColor: darken(colors.colorPrimary, 10),
  },
  primary: {
    background: colors.colorSecondary,
    borderColor: darken(colors.colorSecondary, 10),
  },
  success: {
    background: colors.colorCoreGreen,
    borderColor: darken(colors.colorCoreGreen, 10),
  }
};

const ButtonStyled = styled.button`${props => css`
  border-radius: 20px;
  padding: 0.25em 1em;
  margin: 0 1em;
  background: ${types[props.color].background};
  color: ${colors.colorWhite};
  border: 2px solid ${types[props.color].borderColor};

  &:hover {
    cursor: pointer;
    background: ${darken(types[props.color].background, 10)};
  }
`}`;

function Button({ color, children }) {
  return (
    <ButtonStyled color={color}>
      {children}
    </ButtonStyled>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    "default",
    "primary",
    "success",
  ]),
};

Button.defaultProps = {
  color: "default",
  children: "Button",
};

export default Button;
