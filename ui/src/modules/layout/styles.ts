import {
  BarItems,
  CenterContent,
  ContenFooter,
  ContentBox,
  ContentHeader,
  Contents,
  FieldStyle,
  FlexContent,
  FlexItem,
  FlexRightItem,
  HeightedWrapper,
  MainContent,
  PageHeader,
  SectionBodyItem,
  SidebarBox,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList,
  SidebarTitle,
  WhiteBox,
  WhiteBoxRoot
} from 'erxes-ui/lib/layout/styles';
import { twinkling } from 'modules/common/utils/animations';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

import { colors, dimensions } from '../common/styles';
import { rgba } from '../common/styles/color';

const wideNavigation =
  dimensions.headerSpacingWide +
  dimensions.headerSpacingWide +
  dimensions.coreSpacing;

const UserHelper = styled.div`
  height: 50px;
  display: flex;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

const Layout = styledTS<{ isSqueezed?: boolean }>(styled.main)`
  height: ${props => (props.isSqueezed ? 'calc(100% - 36px)' : '100%')};
  display: flex;
  flex: 1;
  max-width: 100%;
  position: relative;
  overflow: hidden;

  ${props =>
    props.isSqueezed &&
    css`
      ${PageHeader} {
        top: 36px;
      }
    `};
`;

const MainWrapper = styledTS<{ collapsed: boolean }>(styled.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${dimensions.headerSpacing}px;
  padding-left: ${props =>
    props.collapsed ? wideNavigation : dimensions.headerSpacingWide}px;
  max-width: 100%;
  transition: width .3s;
`;

const Authlayout = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
  background: ${colors.colorPrimaryDark} url('/images/stars.png') repeat top
    center;
  flex: 1;
  display: flex;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent url('/images/twinkling.png') repeat top center;
    animation: ${twinkling} 200s linear infinite;
  }

  @media (max-width: 768px) {
    overflow: auto;
    padding-bottom: ${dimensions.coreSpacing * 5}px;
  }
`;

const AuthContent = styled.div`
  position: relative;
  margin: auto;
`;

const AuthDescription = styled.div`
  margin: 20px 0;

  img {
    width: 100px;
    margin-bottom: 50px;
  }

  h1 {
    font-weight: bold;
    font-size: 34px;
    margin: 10px 0 30px;
    color: ${colors.colorWhite};
  }

  h2 {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4em;
    font-weight: 500;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 50px;
    font-size: 18px;
    line-height: 1.8em;
  }

  a {
    color: rgba(255, 255, 255, 0.7);
    &:hover {
      color: ${colors.colorWhite};
    }
  }
  .not-found {
    margin-top: 0;
  }
`;

const MobileRecommend = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: 12px;
  background: linear-gradient(
    to right,
    ${colors.colorSecondary},
    ${colors.colorCoreTeal}
  );
  color: ${colors.colorWhite};
  transition: all ease 0.3s;
  padding: 15px ${dimensions.coreSpacing}px;
  box-shadow: 0 -5px ${dimensions.unitSpacing}px 0 ${rgba(colors.colorBlack, 0.2)};
`;

const PasswordWithEye = styled.div`
  display: flex;
  align-items: center;

  > i {
    margin-left: 10px;
    margin-top: 3px;

    &:hover {
      color: ${colors.textPrimary};
      cursor: pointer;
    }
  }
`;

const LeftNavigation = styledTS<{ collapsed: boolean }>(styled.aside)`
  width: ${props =>
    props.collapsed ? wideNavigation : dimensions.headerSpacingWide}px;
  background: ${colors.colorPrimaryDark};
  box-shadow: 1px 0px 5px rgba(0, 0, 0, 0.1);
  z-index: 11;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;

  > a {
    display: flex;
    margin-top: ${dimensions.unitSpacing / 2}px;
    height: ${dimensions.headerSpacing}px;
    justify-content: center;
    align-items: center;

    img {
      max-height: ${props => (props.collapsed ? '35' : '28')}px;
      transition: all 0.3s ease;
      max-width: 80%;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
`;

const Nav = styledTS<{ collapsed: boolean }>(styled.nav)`
  display: block;
  margin-top: ${dimensions.unitSpacing / 2}px;
  height: calc(100% - 130px);

  > div > a {
    display: flex;
    align-items: center;
    color: ${colors.bgLight}
    height: ${dimensions.headerSpacing + 10}px;
    justify-content: ${props => !props.collapsed && 'center'};
    position: relative;
    transition: all 0.3s ease;

    i, label {
      opacity: .8;
      cursor: pointer;
    }

    i {
      padding: ${props => props.collapsed && '0 15px 0 20px'};
      transition: all 0.3s ease;
    }

    span {
      position: absolute;
      left: ${props =>
        props.collapsed
          ? dimensions.coreSpacing + dimensions.unitSpacing
          : dimensions.coreSpacing + dimensions.coreSpacing - 1}px;
      bottom: 12px;
      padding: 4px;
      min-width: 19px;
      min-height: 19px;
      text-align: center
    }

    &.active {
      background: rgba(0, 0, 0, 0.13);

      &:before {
        content: "";
        width: 3px;
        background: ${colors.colorCoreTeal};
        position: absolute;
        display: block;
        left: 0;
        top: 5px;
        bottom: 5px;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
      }

      > i, label {
        opacity: 1;
      }
    }

    &:focus {
      outline: 0;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.06);

      > i, label {
        opacity: 1;
      }
    }

    &.bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
    }

    @media (max-height: 760px) {
      height: ${dimensions.headerSpacing}px;

      i {
        line-height: ${dimensions.headerSpacing}px;
      }
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavIcon = styled.i`
  font-size: 16px;
  line-height: ${dimensions.headerSpacing + 10}px;
  color: ${colors.colorWhite};
`;

const SubNav = styledTS<{ collapsed: boolean }>(styled.ul)`
  background: ${colors.colorSecondary};
  position: absolute;
  left: ${props =>
    props.collapsed
      ? wideNavigation
      : dimensions.headerSpacing + dimensions.coreSpacing}px;
  word-wrap: break-word;
  width: 200px;
  max-height: 100vh;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  z-index: 999;
  visibility: hidden;
  top: 0;
  margin: 0;
  padding: 0;
  color: ${colors.colorShadowGray};
  list-style: none;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;

  &:after {
    content: " ";
    border: solid transparent;
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-width: ${dimensions.unitSpacing}px;
    top: ${dimensions.coreSpacing}px;
    left: -${dimensions.coreSpacing}px;
    z-index: 10000;
    border-right-color: ${colors.colorSecondary};

    @media (max-height: 760px) {
      top: ${dimensions.coreSpacing - 5}px;
    }
  }
`;

const SubNavItem = styledTS<{ additional: boolean }>(styled.li)`
    > a {
      padding: ${dimensions.unitSpacing - 4}px ${dimensions.unitSpacing}px;
      margin: ${dimensions.unitSpacing - 5}px ${dimensions.unitSpacing}px;
      color: ${colors.colorWhite};
      opacity: .8;
      display: flex;
      align-items: center;
      border-radius: ${props =>
        !props.additional && dimensions.unitSpacing - 5}px;
      border-top: ${props =>
        props.additional && `1px solid ${rgba(colors.borderPrimary, 0.6)}`};
      border-bottom-left-radius: ${props =>
        props.additional && dimensions.unitSpacing - 5}px;
      border-bottom-right-radius: ${props =>
        props.additional && dimensions.unitSpacing - 5}px;

      > i {
        font-size: 16px;
        margin-right: ${dimensions.unitSpacing}px;
      }

      &.active {
        opacity: 1;
        font-weight: bold;
        position: relative;
        background: ${rgba(colors.colorBlack, 0.07)};
      }

      &:hover  {
        background: ${rgba(colors.colorBlack, 0.06)};
        opacity: 1;
      }
    }
`;

const SubNavTitle = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px 2px;
  text-transform: uppercase;
  color: ${colors.colorWhite};
  font-weight: 500;
`;

const NavItem = styled.div`
  position: relative;

  &:hover {
    ${SubNav} {
      visibility: visible;
    }
  }
`;

const DropNav = styled.a`
  position: relative;
  display: flex !important;
  align-items: center;
  justify-content: space-between;

  ul {
    position: absolute;
    visibility: hidden;
    top: 0px;
    left: auto;
    margin: 0px;
    right: 0px;
    background: #fff;
    padding: 0;
    list-style: none;
    transform: translate(-240px, 0px);
    box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
  }

  &:hover {
    ul {
      visibility: visible;
    }
  }
`;

const DropSubNav = styled.ul`
  background: ${colors.colorSecondary};
  word-wrap: break-word;
  width: auto;
  top: 0;
  margin: 0;
  padding: ${dimensions.unitSpacing - 5}px;
  list-style: none;
  transition: all 0.9s ease-out;

  &:after {
    content: ' ';
    position: absolute;
    pointer-events: none;
    z-index: 10000;
    left: ${dimensions.headerSpacing + 15}px;
    top: ${dimensions.headerSpacing}px;
    width: 0;
    height: 0;
    border-left: ${dimensions.unitSpacing + 2}px solid transparent;
    border-right: ${dimensions.unitSpacing + 2}px solid transparent;
    border-bottom: ${dimensions.unitSpacing}px solid ${colors.colorSecondary};

    @media (max-height: 760px) {
      top: ${dimensions.headerSpacing - 10}px;
    }
  }
`;

const DropSubNavItem = styled.li`
  padding: ${dimensions.unitSpacing - 6}px;

  > a {
    padding: ${dimensions.unitSpacing - 3}px ${dimensions.unitSpacing + 2}px;
    color: ${colors.colorWhite};
    opacity: 0.8;
    display: flex;
    align-items: center;
    border-radius: 5px;

    > i {
      font-size: 14px;
      margin-right: ${dimensions.unitSpacing}px;
    }

    &.active {
      opacity: 1;
      font-weight: bold;
      position: relative;
      background: ${rgba(colors.colorBlack, 0.07)};
    }

    &:hover {
      background: ${rgba(colors.colorBlack, 0.06)};
      opacity: 1;
    }
  }
`;

const ExpandIcon = styledTS<{ collapsed: boolean }>(styled.div)`
  background: ${props =>
    !props.collapsed ? colors.colorPrimaryDark : colors.colorWhite};
  position: absolute;
  top: 12px;
  z-index: 999;
  right: -12px;
  cursor: pointer;
  height: ${dimensions.coreSpacing + 5}px;
  width: ${dimensions.coreSpacing + 5}px;
  border-radius: ${dimensions.headerSpacing}px;
  text-align: center;
  transition: all 0.3s;

  > i {
    color: ${props =>
      props.collapsed ? colors.colorPrimaryDark : colors.colorWhite};
    line-height: ${dimensions.coreSpacing + 5}px;
    transition: all ease 0.3s;
  }

  &:hover {
    width: 30px;
    right: -15px;

    > i {
      float: ${props => (props.collapsed ? 'left' : 'right')};
    }
  }
}
`;

export {
  Layout,
  MainWrapper,
  HeightedWrapper,
  Contents,
  MainContent,
  ContentBox,
  ContenFooter,
  ContentHeader,
  CenterContent,
  BarItems,
  SidebarBox,
  SidebarCounter,
  SidebarFlexRow,
  SidebarTitle,
  UserHelper,
  SidebarList,
  FlexContent,
  FlexItem,
  FlexRightItem,
  WhiteBoxRoot,
  WhiteBox,
  Authlayout,
  AuthContent,
  AuthDescription,
  SectionBodyItem,
  MobileRecommend,
  FieldStyle,
  PasswordWithEye,
  LeftNavigation,
  Nav,
  NavIcon,
  SubNav,
  NavItem,
  SubNavTitle,
  SubNavItem,
  DropSubNav,
  DropSubNavItem,
  DropNav,
  ExpandIcon
};
