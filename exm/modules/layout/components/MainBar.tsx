import QuickNavigation from "../containers/QuickNavigation";
import React from "react";
import { dimensions } from "../../styles";
import styled from "styled-components";

const TopBar = styled.div`
  height: ${dimensions.headerSpacing + dimensions.coreSpacing}px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0;
  flex-shrink: 0;
  z-index: 3;

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
  }
`;

function MainBar() {
  return (
    <TopBar>
      <QuickNavigation />
    </TopBar>
  );
}

export default MainBar;
