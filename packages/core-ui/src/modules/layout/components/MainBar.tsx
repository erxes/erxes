import { colors, dimensions } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import QuickNavigation from '../containers/QuickNavigation';

const TopBar = styled.div`
  height: ${dimensions.headerSpacing}px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0;
  border-bottom: 1px solid ${colors.borderPrimary};
  flex-shrink: 0;
  padding: 0 ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 3;
`;

function MainBar() {
  return (
    <TopBar>
      <QuickNavigation />
    </TopBar>
  );
}

export default MainBar;
