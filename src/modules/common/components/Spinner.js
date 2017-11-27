import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';
import { rgba } from '../styles/color';
import Rotate from '../utils/animateRotate';

const WrapperSpinner = styled.div`
  position: relative;
  margin: 20px auto;
  width: 25px;
  height: 25px;
  animation: ${Rotate} 0.75s linear infinite;
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
