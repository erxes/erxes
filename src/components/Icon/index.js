import React from "react";
import PropTypes from "prop-types";
import styled, { css } from 'styled-components'

const IconStyle = styled.i`${props => css`
	margin-right: 0.3em;
	font-size: ${props.size}em;
`}`;

function Icon({ icon, size }) {
  return (
		<IconStyle className={`ion-${icon}`} size={`${size}`}></IconStyle>
  );
}

Icon.propTypes = {
  icon: PropTypes.node.isRequired,
  size: PropTypes.string.isRequired,
};

export default Icon;
