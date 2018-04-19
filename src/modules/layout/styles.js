import styled, { css } from 'styled-components';
import { colors, dimensions, typography } from '../common/styles';
import { lighten } from '../common/styles/color';

const UserHelper = styled.div`
  height: 50px;
  display: flex;
  align-items: center;

  &:hover {
    cursor: pointer;
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
  padding-top: ${dimensions.headerSpacing}px;
  padding-left: ${dimensions.headerSpacingWide}px;
  max-width: 100%;
`;

const Contents = styled.div`
  display: flex;
  flex: 1;
  margin: ${dimensions.coreSpacing}px;
  margin-right: 0;
  max-height: 100%;

  @-moz-document url-prefix() {
    overflow: hidden;
  }
`;

const MainContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 480px;
  box-shadow: ${props =>
    !props.transparent && `0 0 8px 1px ${colors.shadowPrimary}`};
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
  background: ${props =>
    props.background === 'transparent' ? 'none' : colors[props.background]};
  min-height: ${dimensions.headerSpacing}px;
  padding: ${props =>
    props.background === 'transparent' ? 0 : `0 ${dimensions.coreSpacing}px`};
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

  input[type='text'] {
    width: auto;
    display: inline-block;
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
    props.full ? `0 0 8px 1px ${colors.shadowPrimary}` : 'none'};
`;

const SidebarHeader = styled.div`
  background-color: ${colors.bgLight};
  height: ${dimensions.headerSpacing}px;
  margin-bottom: ${props => props.spaceBottom && '10px'};
  align-items: center;
  padding: 0 ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  text-transform: ${props => props.uppercase && 'uppercase'};
  font-weight: ${props => (props.bold ? 'bold' : 'normal')};
  display: flex;
  font-size: ${typography.fontSizeHeading8}px;
  flex-direction: row;
  justify-content: space-between;
`;

const SidebarTitle = SidebarHeader.withComponent('h3').extend`
  padding: 0 ${dimensions.coreSpacing}px;
  margin: 0 0 -1px 0;
  text-transform: uppercase;
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
  background-color: ${props => (props.noBackground ? '' : colors.colorWhite)};
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: ${props =>
    props.noShadow ? 'none' : `0 0 8px 1px ${colors.shadowPrimary}`};
  padding-bottom: ${props =>
    props.collapsible
      ? `${dimensions.coreSpacing}px`
      : `${dimensions.unitSpacing}px`};
  position: ${props => (props.full ? 'initial' : 'relative')};
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

  ul {
    margin-top: 10px;
  }
`;

const SidebarToggle = styled.a`
  width: 100%;
  color: ${colors.colorCoreGray};
  position: absolute;
  bottom: 0;
  text-align: center;
  padding: 2px 0;
  font-size: 10px;
  background: ${colors.bgLight};
  border-top: 1px solid ${colors.borderPrimary};

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: 0;
  }
`;

const HelperButtons = styled.div`
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: 15px;

  a {
    float: left;
    color: ${colors.colorCoreLightGray};
    text-transform: none;
    cursor: pointer;
    margin-left: ${dimensions.unitSpacing}px;
    font-size: ${typography.fontSizeHeading8}px;
    font-weight: ${typography.fontWeightLight};
    outline: 0;

    > i {
      font-size: 14px;
      margin-right: 0;

      &:hover {
        color: ${colors.colorCoreBlack};
      }
    }
  }
`;

const SidebarContent = styled.div`
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
`;

const SidebarList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li.child-segment {
    border-bottom: none;
    background-color: ${colors.bgLight};

    > span {
      background-color: ${colors.bgLight};
      box-shadow: -2px 0 10px 2px ${colors.bgLight};
    }
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
    border-left: 2px solid transparent;
    transition: background 0.3s ease;

    > i {
      margin-right: 5px;
    }

    &:hover,
    &.active {
      cursor: pointer;
      background: ${colors.bgActive};
      text-decoration: none;
      outline: 0;
      color: ${lighten(colors.textPrimary, 40)};
    }

    &.active {
      border-left: 2px solid ${colors.colorSecondary};
    }
  }

  .icon {
    margin-right: 6px;
    color: ${colors.colorCoreGray};
  }
`;

const SidebarCounter = styled.span`
  font-size: ${typography.fontSizeHeading8}px;
  text-align: right;
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 10px;

  a {
    padding: 0;
    color: ${colors.linkPrimary};
  }

  span {
    float: right;
    margin-left: 5px;
  }

  ${props =>
    props.nowrap &&
    css`
      width: 100%;
      white-space: normal;
      position: initial;
      margin-left: 10px;
    `};
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

const WhiteBoxRoot = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 8px 1px ${colors.shadowPrimary};
`;

const WhiteBox = WhiteBoxRoot.extend`
  flex: 1;
  overflow: auto;
  position: relative;
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
    color: ${colors.colorWhite};
  }
  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 50px;
    font-size: 16px;
    line-height: 1.8em;
  }
  a {
    color: rgba(255, 255, 255, 0.7);
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
  SidebarTitle,
  UserHelper,
  SidebarList,
  SidebarContent,
  FlexContent,
  FlexItem,
  FlexRightItem,
  WhiteBoxRoot,
  WhiteBox,
  Authlayout,
  AuthContent,
  AuthDescription
};
