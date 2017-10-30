import styled from 'styled-components';
import { colors, dimensions } from '../common/styles';
import { rgba } from '../common/styles/color';

const UserHelper = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  height: 50px;
  display: flex;
  align-items: center;
  background: ${rgba(colors.colorWhite, 0.1)};

  &:hover {
    cursor: pointer;
    background: ${rgba(colors.colorWhite, 0.15)};
  }
`;

const Main = styled.main`
  flex: 1;
  height: 100%;
  max-width: 100%;
`;

const Layout = styled.div`
  height: 100%;
  display: flex;
  max-width: 100%;
`;

const LeftNavigation = styled.aside`
  width: ${dimensions.headerSpacingWide}px;
  background: ${colors.colorCoreBlack};
  flex-shrink: 0;

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
  background: ${colors.colorCoreBlack};
  margin-top: 10px;

  > a {
    display: block;
    text-align: center;
    height: ${dimensions.headerSpacing + 10}px;
    font-size: ${dimensions.coreSpacing}px;
    line-height: ${dimensions.headerSpacing + 10}px;
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
  max-width: calc(100% - 70px);
`;

const TopBar = styled.div`
  height: ${dimensions.headerSpacing}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const ContentSpace = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ContentBox = styled.div`
  flex: 1;
  background-color: ${colors.bgLight};
  overflow: auto;
  box-shadow: 0 0 4px ${colors.shadowPrimary};
  margin-right: ${dimensions.coreSpacing}px;
  position: relative;
`;

const ContenFooter = styled.div`
  background: ${colors.colorWhite};
`;

const ContentHeader = styled.div`
  background: ${props => (props.invert ? colors.bgLight : colors.colorWhite)};
  min-height: ${dimensions.headerSpacing}px;
  padding: 0 ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px;
  margin-right: ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  justify-content: space-between;
`;

const BarItems = styled.div`
  > * + * {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const HeaderItems = styled.div`
  align-self: center;
  margin-left: ${props => props.rightAligned && 'auto'};
`;

const SideContent = styled.section`
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: ${props => (props.wide ? '360px' : '300px')};
  margin-right: ${dimensions.coreSpacing}px;
  background: ${props => (props.full ? colors.colorWhite : 'none')};
  box-shadow: ${props =>
    props.full ? `0 0 4px ${colors.shadowPrimary}` : 'none'};
`;

const SidebarHeader = styled.div`
  background-color: ${colors.bgLight};
  height: ${dimensions.headerSpacing}px;
  line-height: ${dimensions.headerSpacing}px;
  padding: 0 ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SidebarMainContent = styled.div`
  overflow: auto;
  flex: 1;
`;

const SidebarFooter = SidebarHeader.extend``;

const SidebarBox = styled.div`
  background-color: ${colors.colorWhite};
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: ${props =>
    props.noShadow ? 'none' : `0 0 4px ${colors.shadowPrimary}`};
  padding-bottom: ${props => (props.collapsible ? 0 : 0)}px;
  position: relative;
  transition: max-height 0.4s;
  overflow: ${props => (props.collapsible ? 'hidden' : 'auto')};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SidebarToggle = styled.a`
  outline: 0;
  width: 100%;
  color: #ddd;
  position: absolute;
  bottom: 0;
  text-align: center;
  font-size: 12px;
  background: linear-gradient(
    0deg,
    white 0%,
    white 51%,
    rgba(255, 255, 255, 0) 100%
  );
`;

const HelperButtons = styled.div`
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: 16px;
`;

const QuickButton = styled.a`
  float: left;
  color: ${colors.colorCoreLightGray};
  text-transform: none;
  cursor: pointer;
  margin-left: ${dimensions.unitSpacing};
  font-size: 12px;
  font-weight: 300;
  outline: 0;
  > i {
    font-size: 14px;

    &:hover {
      color: ${colors.colorCoreBlack};
    }
  }
`;

const SidebarTitle = styled.h3`
  color: ${colors.colorCoreLightGray};
  font-size: 12px;
  font-weight: 300;
  text-transform: uppercase;
  padding: ${dimensions.coreSpacing}px;
  margin: 0;
`;

const SidebarList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    border-bottom: 1px solid ${colors.borderPrimary};

    &:last-child {
      border: none;
    }
  }

  li.child-segment {
    border-bottom: none;
    background-color: ${colors.bgLight};
  }

  a {
    display: block;
    padding: 8px 20px;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    text-decoration: none;
    outline: 0;

    &:hover {
      background: ${colors.borderPrimary};
      text-decoration: none;
      color: ${colors.colorCoreBlack};
    }
  }

  .icon {
    margin-right: 6px;
    color: ${colors.colorCoreGray};
  }
`;

const SidebarCounter = styled.span`
  font-size: 12px;
  text-align: right;
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  position: absolute;
  right: 20px;
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
  ContentSpace,
  HeaderItems,
  BarItems,
  SideContent,
  SidebarHeader,
  SidebarMainContent,
  SidebarFooter,
  SidebarBox,
  SidebarToggle,
  SidebarCounter,
  HelperButtons,
  QuickButton,
  SidebarTitle,
  UserHelper,
  SidebarList
};
