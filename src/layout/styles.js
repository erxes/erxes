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
    color: ${rgba(colors.colorWhite, 0.7)};

    &:hover {
      color: ${colors.colorWhite};
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
  margin-right: 0;
`;

const MainContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 480px;
`;

const ContentBox = styled.div`
  flex: 1;
  background-color: ${colors.bgLight};
  overflow: auto;
  box-shadow: 0 0 4px ${colors.shadowPrimary};
  margin-right: ${dimensions.coreSpacing}px;
`;

const ContenFooter = styled.div`
  background: ${colors.colorWhite};
`;

const ContentHeader = styled.div`
  background: ${colors.colorWhite};
  height: ${dimensions.headerSpacing}px;
  line-height: ${dimensions.headerSpacing}px;
  padding: 0 ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px;
`;

const HeaderItems = styled.div`
  float: ${props => props.rightAligned ? 'right' : 'left'};
`;

const SideContent = styled.section`
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: ${props => props.wide ? '360px' : '300px'};
  margin-right: ${dimensions.coreSpacing}px;
`;

const SidebarBox = styled.div`
  background-color: ${colors.colorWhite};
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: 0 0 4px ${colors.shadowPrimary};
  position: relative;
`;


export {
  Main,
  Layout,
  LeftNavigation,
  Nav,
  MainWrapper,
  TopBar,
  Contents,
  MainContent,
  ContentBox,
  ContenFooter,
  ContentHeader,
  HeaderItems,
  SideContent,
  SidebarBox,
}
