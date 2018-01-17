import styled from 'styled-components';
import { colors, dimensions } from '../common/styles';

const UserHelper = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  height: 50px;
  display: flex;
  align-items: center;
  background: ${colors.bgLight};

  &:hover {
    cursor: pointer;
    background: ${colors.bgUnread};
  }
`;

const Layout = styled.main`
  height: 100%;
  display: flex;
  flex: 1;
  max-width: 100%;
`;

const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: calc(100% - ${dimensions.headerSpacingWide}px);
`;

const Contents = styled.div`
  display: flex;
  flex: 1;
  margin: ${dimensions.coreSpacing}px;
  margin-right: 0;
  max-height: calc(
    100% - ${dimensions.headerSpacingWide + dimensions.coreSpacing}px
  );
`;

const MainContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 480px;
  box-shadow: ${props =>
    !props.transparent && `0 0 4px ${colors.shadowPrimary}`};
  margin-right: ${dimensions.coreSpacing}px;
`;

const ContentSpace = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ContentBox = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  background-color: ${props => !props.transparent && colors.colorWhite};
`;

const ContentHeader = styled.div`
  background: ${props => (props.invert ? colors.colorWhite : colors.bgLight)};
  min-height: ${dimensions.headerSpacing}px;
  padding: 0 ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  justify-content: space-between;
`;

const ContenFooter = styled.div`
  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
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
  box-sizing: border-box;
  display: flex;
  position: relative;
  flex-direction: column;
  flex-shrink: 0;
  width: ${props => (props.wide ? '360px' : '300px')};
  flex: ${props => (props.half ? '1' : 'none')};
  margin-right: ${dimensions.coreSpacing}px;
  background: ${props => (props.full ? colors.colorWhite : 'none')};
  box-shadow: ${props =>
    props.full ? `0 0 4px ${colors.shadowPrimary}` : 'none'};
`;

const SidebarHeader = styled.div`
  background-color: ${colors.bgLight};
  height: ${dimensions.headerSpacing}px;
  margin-bottom: ${props => props.spaceBottom && '10px'};
  align-items: center;
  padding: 0 ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SidebarMainContent = styled.div`
  overflow: auto;
  flex: 1;
  position: relative;
`;

const SidebarFooter = SidebarHeader.extend`
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom: none;
`;

const SidebarBox = styled.div`
  background-color: ${colors.colorWhite};
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: ${props =>
    props.noShadow ? 'none' : `0 0 4px ${colors.shadowPrimary}`};
  padding-bottom: 10px;
  position: relative;
  justify-content: center;
  transition: max-height 0.4s;
  overflow: ${props => (props.collapsible ? 'hidden' : 'auto')};
  display: ${props => props.full && 'flex'};

  &:last-child {
    margin-bottom: 0;
  }
`;

const BoxContent = styled.div`
  flex: 1;
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

const QuickButton = styled.a`
  float: left;
  color: ${colors.colorCoreLightGray};
  text-transform: none;
  cursor: pointer;
  margin-left: ${dimensions.unitSpacing}px;
  font-size: 12px;
  font-weight: 300;
  outline: 0;

  > i {
    font-size: 14px;
    margin-right: 0;

    &:hover {
      color: ${colors.colorCoreBlack};
    }
  }
`;

const HelperButtons = styled.div`
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: 16px;

  a {
    color: ${colors.colorCoreLightGray};
    cursor: pointer;
    font-size: 12px;

    > i {
      font-size: 14px;
      margin-right: 0;

      &:hover {
        color: ${colors.colorCoreBlack};
      }
    }
  }
`;

const SidebarTitle = styled.h3`
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  padding: ${dimensions.coreSpacing}px;
  margin: 0;
`;

const SidebarContent = styled.div`
  padding: 0px ${dimensions.coreSpacing}px;
`;

const SidebarList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li.child-segment {
    border-bottom: none;
    background-color: ${colors.bgLight};
  }

  &.no-link li,
  a {
    display: block;
    padding: 6px 20px;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    outline: 0;
    position: relative;

    > span {
      font-size: 12px;
      text-align: right;
      color: #888;
      margin-top: 2px;
      position: absolute;
      right: 20px;
    }

    &:hover,
    &.active {
      cursor: pointer;
      background: ${colors.borderPrimary};
      text-decoration: none;
      outline: 0;
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
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    padding: 0;
    color: ${colors.linkPrimary};
  }
`;

const FlexContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
`;

const FlexItem = styled.div`
  flex: ${props => (props.count ? props.count : 1)};
  position: relative;
`;

const FlexRightItem = styled.div`
  margin-left: auto;
`;

const WhiteBox = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 4px ${colors.shadowPrimary};
`;

const Authlayout = styled.div`
  background: url('/images/sign-in.jpg') no-repeat;
  background-size: cover;
  height: 100%;
  overflow: hidden;
  position: relative;
  flex: 1;

  &:before {
    content: '';
    background-color: rgba(69, 38, 121, 0.7);
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

const AuthContent = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
`;

const AuthDescription = styled.div`
  margin-top: 60px;
  img {
    width: 100px;
    margin-bottom: 50px;
  }
  h1 {
    font-weight: bold;
    font-size: 32px;
    margin-bottom: 30px;
    color: #fff;
  }
  p {
    color: #c9b6e8;
    margin-bottom: 50px;
    font-size: 16px;
    line-height: 1.8em;
  }
  a {
    color: #c9b6e8;
  }
  .not-found {
    margin-top: 0;
  }
`;

export {
  Layout,
  MainWrapper,
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
  BoxContent,
  SidebarToggle,
  SidebarCounter,
  HelperButtons,
  QuickButton,
  SidebarTitle,
  UserHelper,
  SidebarList,
  SidebarContent,
  FlexContent,
  FlexItem,
  FlexRightItem,
  WhiteBox,
  Authlayout,
  AuthContent,
  AuthDescription
};
