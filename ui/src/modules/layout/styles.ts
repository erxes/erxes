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
  PasswordWithEye
};
