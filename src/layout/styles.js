import styled from "styled-components"
import { colors, dimensions } from '../styles';
import { rgba } from "../utils/color";

const Main = styled.main`
  height: 100%;
`;

const Layout = styled.div`
  height: 100%;
  display: flex;
`;

const LeftNavigation = styled.aside`
  width: ${dimensions.headerSpacingWide}px;
  background: ${colors.colorCoreBlack};

  > a {
    background-color: ${rgba(colors.colorPrimary, 0.7)};
    line-height: ${dimensions.headerSpacing}px;
    display: flex;
    height: ${dimensions.headerSpacing}px;
    justify-content: center;
    align-items: center;
    color: #fff;
  }
`;

const Nav = styled.nav`
  display: block;

  > a {
    display: block;
    text-align: center;
    height: ${dimensions.headerSpacingWide}px;
    font-size: ${dimensions.coreSpacing}px;
    line-height: ${dimensions.headerSpacingWide}px;
    text-align: center;
    color: ${colors.colorWhite};

    &:hover {
      background: ${rgba(colors.colorBlack, 0.2)};
    }
  }
`;

const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  height: ${dimensions.headerSpacing}px;
  line-height: ${dimensions.headerSpacing}px;
  margin: 0;
  border: 0;
  flex-shrink: 0;
  padding: 0 ${dimensions.coreSpacing}px;
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
`;

const Contents = styled.div`
  display: flex;
  flex: 1;
  margin: ${dimensions.coreSpacing}px;
  overflow: hidden;
`;


export {
  Main,
  Layout,
  LeftNavigation,
  Nav,
  MainWrapper,
  TopBar,
  Contents,
}
