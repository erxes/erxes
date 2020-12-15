import {
    CenterContent, ContenFooter, ContentBox, ContentHeader, Contents, FieldStyle, HeightedWrapper,
    MainContent, PageHeader, SidebarBox, SidebarCounter, SidebarList, SidebarTitle, WhiteBox,
    WhiteBoxRoot
} from 'erxes-ui';
import { twinkling } from 'modules/common/utils/animations';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

import { colors, dimensions } from '../common/styles';
import { rgba } from '../common/styles/color';

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

const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${dimensions.headerSpacing}px;
  padding-left: ${dimensions.headerSpacingWide}px;
  max-width: 100%;
`;

const BarItems = styled.div`
  white-space: nowrap;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-evenly;

  .dropdown-menu {
    min-width: 200px;
  }

  > * + * {
    margin: 5px 0 5px ${dimensions.unitSpacing}px;
  }

  .Select {
    min-width: 200px;
  }

  input[type='text'] {
    width: auto;
    display: inline-block;
  }

  @media (max-width: 768px) {
    > * + * {
      margin: 3px 0 3px ${dimensions.unitSpacing / 2}px;
    }
  }
`;

const SidebarFlexRow = styled.li`
  white-space: inherit !important;
  display: flex !important;
  justify-content: space-between;

  span {
    color: ${colors.colorCoreGray};
    overflow: hidden;
    max-height: 140px;
    padding-left: ${dimensions.coreSpacing}px;
    text-align: right;
  }
`;

const FlexContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
`;

const FlexItem = styledTS<{ count?: number; hasSpace?: boolean }>(styled.div)`
  flex: ${props => (props.count ? props.count : 1)};
  position: relative;

  ${props =>
    props.hasSpace &&
    css`
      margin-left: ${dimensions.coreSpacing}px;
    `};
`;

const FlexRightItem = styled.div`
  margin-left: auto;
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

const SectionContainer = styled.div`
  overflow: hidden;
  padding: 10px 10px 0px 10px;
  border-top: 1px solid ${colors.borderPrimary};
  word-break: break-word;
`;

const SectionBodyItem = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  word-break: break-word;

  > a {
    padding: 10px 20px;
    display: flex;
    width: 100%;
    color: ${colors.textSecondary};

    &:hover {
      text-decoration: underline;
    }
  }

  > span {
    display: block;
    padding: 0px 20px 10px 20px;
    margin-top: -10px;
  }

  ul li {
    margin-left: ${dimensions.coreSpacing}px;
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
  SectionContainer,
  SectionBodyItem,
  MobileRecommend,
  FieldStyle,
  PasswordWithEye
};
