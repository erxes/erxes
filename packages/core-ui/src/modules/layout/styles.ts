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
} from '@erxes/ui/src/layout/styles';
import { Modal } from 'react-bootstrap';
import { twinkling } from 'modules/common/utils/animations';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

import { colors, dimensions } from '../common/styles';
import { rgba } from '../common/styles/color';
import { getThemeItem } from '@erxes/ui/src/utils/core';

const thBackground = getThemeItem('background');
const thColor = getThemeItem('text_color');

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

const MainWrapper = styledTS<{ navCollapse?: number }>(styled.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${dimensions.headerSpacing}px;
  padding-left: ${props =>
    props.navCollapse === 2
      ? dimensions.headerSpacing * 2 - 1
      : props.navCollapse === 1
      ? dimensions.headerSpacing - 5
      : dimensions.headerSpacing * 3 + dimensions.unitSpacing}px;
  max-width: 100%;
  transition: width 0.3s;
`;

const Authlayout = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
  background: ${
    thBackground
      ? thBackground
      : `${colors.colorPrimaryDark} url('/images/stars.png') repeat top center;`
  }
  color: ${thColor ? thColor : ''}
  flex: 1;
  display: flex;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${
      thBackground
        ? thBackground
        : `transparent url('/images/twinkling.png') repeat top center;`
    }
    animation: ${twinkling} 200s linear infinite;
  }

  @media (max-width: 768px) {
    overflow: auto;
    padding-bottom: ${dimensions.coreSpacing * 5}px;
  }
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

const LeftNavigation = styled.aside`
  background: ${colors.colorWhite};
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
      max-height: ${dimensions.coreSpacing + 15}px;
      transition: all 0.3s ease;
      max-width: 80%;
      color: ${colors.colorPrimary};

      &:hover {
        transform: scale(1.1);
      }
    }
  }
`;

const NavMenuItem = styledTS<{ navCollapse?: number; isMoreItem?: boolean }>(
  styled.div
)`
  width: 100%;
  > a {  
    display: flex;
    color: ${colors.bgLight};
    background: ${colors.colorWhite};
    height: ${props =>
      props.isMoreItem || props.navCollapse === 2
        ? dimensions.headerSpacingWide
        : dimensions.headerSpacing}px;
    flex-direction: ${props =>
      props.navCollapse === 3
        ? !props.isMoreItem
          ? 'row'
          : 'column'
        : 'column'};
    padding: ${props =>
      props.isMoreItem
        ? dimensions.unitSpacing
        : props.navCollapse === 3 && dimensions.coreSpacing}px;
    justify-content: ${props =>
      props.isMoreItem ? 'center' : props.navCollapse !== 3 && 'center'};
    align-items: center;
    transition: all 0.3s ease;
    width: ${props =>
      props.isMoreItem
        ? dimensions.headerSpacingWide
        : props.navCollapse === 1
        ? dimensions.headerSpacing - 5
        : props.navCollapse === 3
        ? dimensions.headerSpacing * 3 + dimensions.unitSpacing
        : dimensions.headerSpacing * 2 - 1}px;
    border: ${props => props.isMoreItem && '1px solid'};
    border-color: ${props => props.isMoreItem && colors.borderPrimary};
    border-radius: ${props => props.isMoreItem && '4px'};

    label {
      cursor: pointer;
      font-size: 12px;
      letter-spacing: 0.4px;
      text-align:  center;
      justify-content: center;
      opacity: 0.6;
      color:${colors.colorBlack};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-left:  ${props =>
        props.navCollapse === 3
          ? !props.isMoreItem && dimensions.unitSpacing
          : 0}px;
      padding: ${props =>
        props.navCollapse === 2 && `0 ${dimensions.unitSpacing}px`};
      max-width: ${props =>
        props.isMoreItem
          ? dimensions.headerSpacingWide
          : props.navCollapse === 1
          ? dimensions.headerSpacing - 5
          : props.navCollapse === 3
          ? dimensions.headerSpacing * 3 + dimensions.unitSpacing
          : dimensions.headerSpacing * 2 - 1}px;
    }

    > span {
      position: absolute;
      right: ${props =>
        props.navCollapse === 1 ? 5 : dimensions.coreSpacing + 5}px;
      top: ${dimensions.coreSpacing}px;
      padding: 0;
      width: ${dimensions.coreSpacing}px;
      height: ${dimensions.coreSpacing}px;
      line-height: ${dimensions.coreSpacing}px;
      text-align: center;
    }

    &.active {
      background: #f0eef9;

      &:before {
        content: "";
        width: 2px;
        background: ${props => !props.isMoreItem && colors.colorPrimary};
        height: ${props =>
          props.navCollapse === 2
            ? dimensions.headerSpacingWide
            : dimensions.headerSpacing}px;
        position: absolute;
        right: 0;
        box-shadow: ${props =>
          !props.isMoreItem &&
          '0px 12px 24px rgba(79, 51, 175, 0.24), 0px 2px 6px rgba(79, 51, 175, 0.16), 0px 0px 1px rgba(79, 51, 175, 0.08)'};
      }
        
      > i, label {
        opacity: 1;
        color: ${colors.colorPrimary};
        font-weight: 600;
      }
    }

    &:focus {
      outline: 0;
    }

    &:hover {
      background: rgb(245, 245, 246);

      > i, label {
        opacity: .8;
      }
    }

    &.bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
    }

    @media (max-height: 760px) {
      i {
        line-height: ${dimensions.headerSpacing - dimensions.coreSpacing}px;
      }
    }
  }
`;

const Nav = styled.nav`
  display: block;
  height: calc(100% - 130px);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavImage = styledTS<{ navCollapse?: number }>(styled.img)`
  max-width: ${props =>
    props.navCollapse === 1
      ? dimensions.headerSpacing - 5
      : props.navCollapse === 2
      ? dimensions.headerSpacing * 2 - 1
      : dimensions.headerSpacing * 3 + dimensions.unitSpacing}px !important;
  padding: 5px;
`;

const BottomMenu = styled.div`
  position: absolute;
  bottom: 20px;
`;

const NavIcon = styled.i`
  font-size: 18px;
  color: ${colors.colorBlack};
  opacity: 0.62;
`;

const RoundBox = styledTS<{ pinned?: boolean }>(styled.div)`
  background: ${props => (props.pinned ? colors.colorSecondary : '#f5f5f5')};
  border-radius: 50%;
  border: 1px solid ${colors.borderPrimary};
  width: ${dimensions.coreSpacing}px;
  height: ${dimensions.coreSpacing}px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: -5px;
  top: -5px;

  img {
    filter: ${props => !props.pinned && 'brightness(30%)'};
  }

  &:hover {
    background: ${colors.colorSecondary};

    img {
      filter: none;
    }
  }
`;

const SubNav = styledTS<{ navCollapse: number }>(styled.ul)`
  background: ${colors.colorWhite};
  position: absolute;
  left: ${props =>
    props.navCollapse === 2
      ? dimensions.headerSpacing * 2
      : props.navCollapse === 3
      ? dimensions.headerSpacingWide * 2 + 20
      : dimensions.headerSpacing - 5}px;
  width: 200px;
  box-shadow: 0px 10px 20px rgb(0 0 0 / 4%), 0px 2px 6px rgb(0 0 0 / 4%), 0px 0px 1px rgb(0 0 0 / 4%);
  border: 1px solid ${colors.borderPrimary};
  z-index: 999;
  top: 0;
  margin: 0;
  list-style: none;
  border-radius: 5px;
  padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px ${
  dimensions.unitSpacing
}px ${dimensions.coreSpacing}px;
  visibility: hidden;
`;

const SubNavItem = styledTS<{ additional: boolean }>(styled.li)`
  display: flex;
  flex: 1;

    a {
    padding: 5px ${dimensions.unitSpacing}px;
      color: rgba(0, 0, 0, 0.62);
      display: flex;
      align-items: center;
      border-radius: ${props =>
        !props.additional && dimensions.unitSpacing - 5}px;
      border-top: ${props =>
        props.additional && `1px solid rgba(0, 0, 0, 0.08)`};
      border-bottom-left-radius: ${props =>
        props.additional && dimensions.unitSpacing - 5}px;
      border-bottom-right-radius: ${props =>
        props.additional && dimensions.unitSpacing - 5}px;
      width: 100%;

      > i {
        font-size: 16px;
        margin-right: ${dimensions.unitSpacing}px;
        color: ${colors.colorPrimary};
      }

      &.active {
        opacity: 1;
        color: rgba(0,0,0,.8);
        background: ${rgba(colors.colorBlack, 0.07)};
      }

      &:hover  {
        background: ${rgba(colors.colorBlack, 0.06)};
        opacity: 1;
        border-radius: 4px;
      }
    }

    &:before {
      content: "";
      background: url("/images/line.svg") no-repeat;
      width: 12px;
      height: 25px;
      margin-top: -4px;
    }
`;

const SubNavTitle = styled.div`
  color: ${colors.colorBlack};
  font-weight: 600;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const NavItem = styledTS<{ isMoreItem?: boolean }>(styled.div)`
  position: relative;
  flex: 1;
  cursor : pointer;

  &:hover {
    ${SubNav} {
      visibility: visible;
    }
  }

  @media screen and (max-height: 870px){
    &.more-2 {
      position: fixed;
      bottom: 160px;
    }
  }
  @media screen and (max-height: 560px){
    &.more-1 {
      position: fixed;
      bottom: 120px;
    }
    &.more-3 {
      position: fixed;
      bottom: 120px;
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

const SmallLabel = styled.div`
  position: absolute;
  text-transform: uppercase;
  font-weight: 500;
  font-size: ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreTeal};
  right: ${dimensions.unitSpacing - 5}px;
  top: 3px;
`;

const MoreMenus = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: ${dimensions.unitSpacing}px;
`;

const MoreTitle = styled.h5`
  color: ${colors.colorPrimaryDark};
  margin: 0;
  margin-top: ${dimensions.coreSpacing}px;
`;

const MoreItemRecent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${dimensions.headerSpacing + dimensions.coreSpacing}px;
  height: ${dimensions.headerSpacing + dimensions.coreSpacing}px;
  margin: 5px 10px 0 0;
  cursor: pointer;

  label {
    width: 70px !important;
    padding: 0 ${dimensions.unitSpacing}px;
  }

  i,
  a {
    transition: none !important;
  }

  a.active:before {
    content: none;
  }

  &:nth-child(5n) {
    margin-right: 0;
  }
`;

const MoreMenuWrapper = styledTS<{ visible: boolean; navCollapse: number }>(
  styled.div
)`
  position: absolute;
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  padding:${dimensions.coreSpacing}px ${dimensions.unitSpacing}px ${
  dimensions.coreSpacing
}px ${dimensions.coreSpacing}px;
  width: ${dimensions.headerSpacingWide * 6 + dimensions.unitSpacing}px;
  height: ${dimensions.headerSpacingWide * 4 + dimensions.coreSpacing}px;
  overflow-y: auto;
  left: ${props =>
    props.navCollapse === 2
      ? dimensions.headerSpacing * 2 - 1
      : props.navCollapse === 1
      ? dimensions.headerSpacing - 5
      : dimensions.headerSpacing * 3 + dimensions.unitSpacing}px;
  top: -40px;
  background: ${colors.colorWhite};
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0px 16px 24px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.04),
    0px 0px 1px rgba(0, 0, 0, 0.04);
    cursor : default

  @media (max-height: 760px) {
    top: unset;
    bottom: 0;
  }
`;

const MoreSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${dimensions.unitSpacing}px;
  background: ${colors.bgActive};
  border-radius: ${dimensions.headerSpacingWide}px;
  color: ${colors.colorCoreGray};

  i {
    color: rgba(0, 0, 0, 0.95);
    padding: ${dimensions.unitSpacing - 5}px;
    font-size: 13px;
  }

  input {
    border-bottom: none;
    transition: none;
    height: 25px;
    padding: 5px 0;
  }
`;

const StoreItem = styled(NavItem)`
  bottom: ${dimensions.headerSpacingWide + dimensions.unitSpacing}px;
  left: 0;
  right: 0;
  position: absolute;
`;

const FlexBox = styledTS<{ navCollapse?: number }>(styled.div)`
  display: flex;
  padding: ${dimensions.unitSpacing}px;
  justify-content: ${props => (props.navCollapse === 3 ? 'end' : 'center')};
`;

const CollapseBox = styled.div`
  width: 25px;
  height: 25px;
  border: 1px solid ${colors.borderDarker};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }

  &:nth-child(2) {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const SmallText = styled.div`
  font-size: 10px;
`;

const DropSubNav = styled.ul`
  width: ${dimensions.headerSpacing * 3 + dimensions.unitSpacing}px;
  margin: 0;
  padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.unitSpacing}px ${dimensions.coreSpacing + 5}px;
  list-style: none;
`;

const DropSubNavItem = styled.li`
  display: flex;
  flex: 1;

  a {
    padding: 5px 0 5px ${dimensions.unitSpacing}px;
    color: rgba(0, 0, 0, 0.62);
    letter-spacing: 0.2px;
    width: 100%;

    &.active {
      opacity: 1;
      color: rgba(0, 0, 0, 0.8);
      position: relative;
      background: ${rgba(colors.colorBlack, 0.07)};
    }

    &:hover {
      background: ${rgba(colors.colorBlack, 0.06)};
      opacity: 1;
      border-radius: 4px;
    }
  }

  &:before {
    content: '';
    background: url('/images/line.svg') no-repeat;
    width: 12px;
    height: 25px;
    margin-top: -4px;
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const GotoFormWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 1px solid ${colors.borderDarker};

  input {
    font-size: 16px;
    border: none;
    outline: none;
    padding: 1em 0;
    width: 100%;
    background-color: ${colors.bgLight};
  }

  i {
    margin: 1em;
    cursor: pointer;
  }
`;

const GotoContentWrapper = styled.div`
  max-height: 423px;
  overflow-y: scroll;
  scroll-behaviour: smooth;

  & a:focus {
    outline: none;
  }

  & .active {
    background: ${rgba(colors.colorBlack, 0.06)};
  }
`;

const GotoCategory = styled.div`
  position: sticky;
  top: 0;
  padding: 0.25em 1em;
  font-weight: bolder;
  color: ${colors.colorCoreBlack}
  background-color: ${colors.bgGray}
`;

const GotoItem = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.75em 1em;
  border-bottom: 1px solid ${colors.borderDarker};

  p {
    color: ${colors.colorCoreBlack};
    margin: 0;
  }

  span {
    text-transform: capitalize;
    color: ${colors.colorCoreGray};
    margin-left: auto;
  }

  i {
    color: ${colors.colorCoreGray};
    font-size: 14px;
    margin-right: 1em;
  }

  &:hover {
    background: ${rgba(colors.colorBlack, 0.06)};
  }
`;

const GotoModal = styled(Modal)`
  & > div {
    border-radius: 10px;
    overflow: hidden;
  }
`;

const GotoMenuItem = styled(NavMenuItem)`
  > a {
    height: 50px;
  }
`;

export {
  Layout,
  MoreMenuWrapper,
  MoreSearch,
  StoreItem,
  MoreTitle,
  MoreMenus,
  MoreItemRecent,
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
  AuthDescription,
  SectionBodyItem,
  FieldStyle,
  PasswordWithEye,
  LeftNavigation,
  Nav,
  NavImage,
  NavIcon,
  NavMenuItem,
  SubNav,
  NavItem,
  SubNavTitle,
  SubNavItem,
  DropNav,
  SmallLabel,
  FlexBox,
  CollapseBox,
  SmallText,
  DropSubNav,
  DropSubNavItem,
  Center,
  RoundBox,
  BottomMenu,
  GotoFormWrapper,
  GotoContentWrapper,
  GotoCategory,
  GotoItem,
  GotoModal,
  GotoMenuItem
};
