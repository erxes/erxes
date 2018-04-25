import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';
import { rgba, darken } from '../styles/color';
import { rotate } from 'modules/common/utils/animations';

const WrapperLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: ${darken(colors.colorPrimary, 10)};
  width: 70px;
  height: 50px;
  z-index: 101;
  border-bottom: 1px solid ${rgba(colors.colorWhite, 0.1)};
`;

const MainLoader = styled.div`
  position: relative;
  margin: 14px auto;
  width: 20px;
  height: 20px;
  animation: ${rotate} 0.75s linear infinite;
  border: 2px solid ${colors.colorWhite};
  border-top-color: ${rgba(colors.colorBlack, 0.2)};
  border-right-color: ${rgba(colors.colorBlack, 0.2)};
  border-bottom-color: ${rgba(colors.colorBlack, 0.2)};
  border-radius: 100%;
`;

function Loader() {
  return (
    <WrapperLoader>
      <MainLoader />
    </WrapperLoader>
  );
}

export default Loader;
