import { colors, dimensions } from '../../common/styles';
import { rgba } from '../../common/styles/ecolor';
import React from 'react';
import styled from 'styled-components';
// import QuickNavigation from '../containers/QuickNavigation';

const TopBar = styled.div`
  height: ${dimensions.headerSpacing}px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0;
  border: 0;
  flex-shrink: 0;
  padding: 0 ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  box-shadow: 0 1px 6px ${rgba(colors.colorBlack, 0.1)};
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 3;
`;

function MainBar() {
  return <TopBar>{/* <QuickNavigation /> */}</TopBar>;
}

export default MainBar;
