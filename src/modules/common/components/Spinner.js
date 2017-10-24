import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../styles';
import { rgba } from '../styles/color';

const circle = keyframes`
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
`;

const WrapperSpinner = styled.div`
  position: relative;
  margin: 16px auto;
  width: 25px;
  height: 25px;
  animation: ${circle} 0.75s linear infinite;
  border: 2px solid ${colors.colorWhite};
  border-top-color: ${rgba(colors.colorBlack, 0.2)};
  border-right-color: ${rgba(colors.colorBlack, 0.2)};
  border-bottom-color: ${rgba(colors.colorBlack, 0.2)};
  border-radius: 100%;
  top: 50%;
`;

function Spinner() {
  return <WrapperSpinner />;
}

export default Spinner;
