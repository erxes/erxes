import { TabContainer } from '@erxes/ui/src/components/tabs/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

import { colors, dimensions, typography } from '../styles';
import { lighten, rgba } from '../styles/ecolor';
import { twinkling } from '../utils/animations';

const FlexContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
`;

const WhiteBoxRoot = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 6px 1px ${colors.shadowPrimary};
`;

const WhiteBox = styled(WhiteBoxRoot)`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const PageHeader = styled.div`
  height: ${dimensions.headerSpacing}px;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 3;
  padding-left: ${dimensions.coreSpacing * 1.5}px;
`;

const Contents = styledTS<{ hasBorder?: boolean }>(styled.div)`
  display: flex;
  flex: 1;
  margin-top: ${dimensions.unitSpacing}px;
  max-height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  overflow-x: auto;
  border: ${props => props.hasBorder && `1px solid ${colors.borderPrimary}`};
  border-radius: ${props => props.hasBorder && `${dimensions.unitSpacing}px`};
  margin: ${props => props.hasBorder && dimensions.unitSpacing * 2}px;

  @-moz-document url-prefix() {
    overflow: hidden;
  }
`;

const VerticalContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: 100%;
`;

const HeightedWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const MainHead = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  box-shadow: 0 0 6px 1px ${colors.shadowPrimary};
`;

const MainContent = styledTS<{
  transparent?: boolean;
  center?: boolean;
}>(styled.section)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 480px;
  box-shadow: ${props =>
    !props.transparent && `0 0 6px 1px ${colors.shadowPrimary}`};
  height: ${props => props.center && '100%'};
`;

const ContentBox = styledTS<{
  transparent?: boolean;
  initialOverflow?: boolean;
}>(styled.div)`
  flex: 1;
  overflow: ${props => (props.initialOverflow ? 'initial' : 'auto')};
  position: relative;
  background-color: ${props => !props.transparent && colors.colorWhite};
`;

const ContentHeader = styledTS<{
  background: string;
  zIndex?: number;
  noBorder?: boolean;
  wideSpacing?: boolean;
}>(styled.div)`
  background: ${props =>
    props.background === 'transparent' ? 'none' : colors[props.background]};
  padding: ${props => (props.wideSpacing ? '0 0 12px 0' : 0)};
  margin: ${props => (props.wideSpacing ? '12px 20px 0 20px' : '0 20px')};
  border-bottom: ${props =>
    !props.noBorder && `1px solid ${colors.borderPrimary}`};
  z-index: ${props => props.zIndex || 2};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  min-height: ${dimensions.headerSpacing}px;
`;

const ContenFooter = styled.div`
  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

const HeaderItems = styledTS<{ rightAligned?: boolean; hasFlex?: boolean }>(
  styled.div
)`
  align-self: center;
  flex: ${props => props.hasFlex && 1};
  margin-left: ${props => props.rightAligned && 'auto'};
  > * + * {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const SideContent = styledTS<{
  wide?: boolean;
  half?: boolean;
  full?: boolean;
  hasBorder?: boolean;
}>(styled.section)`
  box-sizing: border-box;
  display: flex;
  position: relative;
  flex-direction: column;
  flex-shrink: 0;
  width: ${props => (props.wide ? '340px' : '290px')};
  flex: ${props => (props.half ? '1' : 'none')};
  background: ${props => (props.full ? colors.colorWhite : 'none')};
  margin: 0 ${dimensions.unitSpacing}px;
  margin: ${props => props.hasBorder && 0};
  border-right: ${props =>
    props.hasBorder && `1px solid ${colors.borderPrimary}`};
  box-shadow: ${props =>
    props.full ? `0 0 6px 1px ${colors.shadowPrimary}` : 'none'};

  ${TabContainer} {
    position: sticky;
    top: 0;
    background: ${colors.colorWhite};
  }
`;

const SidebarHeader = styledTS<{
  spaceBottom?: boolean;
  uppercase?: boolean;
  bold?: boolean;
}>(styled.div)`
  height: ${dimensions.headerSpacing}px;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
  text-transform: ${props => props.uppercase && 'uppercase'};
  font-weight: ${props => (props.bold ? 'bold' : '500')};
  display: flex;
  font-size: ${typography.fontSizeHeading8}px;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px ${dimensions.coreSpacing}px;
`;

const SidebarTitle = styledTS<{
  children: any;
}>(styled(SidebarHeader.withComponent('h3')))`
  padding: 0;
  margin: 0px ${dimensions.coreSpacing}px;
  text-transform: uppercase;
  position: relative;
  background-color: ${colors.colorWhite};
`;

const SidebarMainContent = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
  position: relative;
`;

const SidebarFooter = styledTS<{ children: any }>(styled(SidebarHeader))`
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom: none;
`;

const SidebarBox = styledTS<{
  noBackground?: boolean;
  noShadow?: boolean;
  collapsible?: boolean;
  full?: boolean;
  noMargin?: boolean;
}>(styled.div)`
  background-color: ${props => (props.noBackground ? '' : colors.colorWhite)};
  margin-bottom: ${props => !props.noMargin && dimensions.unitSpacing}px;
  box-shadow: ${props =>
    props.noShadow ? 'none' : `0 0 6px 1px ${colors.shadowPrimary}`};
  padding-bottom: ${props =>
    props.collapsible ? `${dimensions.unitSpacing}px` : '0'};
  position: ${props => (props.full ? 'initial' : 'relative')};
  justify-content: center;
  transition: max-height 0.4s;
  overflow: ${props => (props.collapsible ? 'hidden' : 'initial')};
  display: ${props => props.full && 'flex'};
  &:last-child {
    margin-bottom: 0;
  }
`;

const BoxContent = styled.div`
  flex: 1;
  ul:first-child {
    padding: 10px 0;
  }
`;

const SidebarToggle = styledTS<{ inverse?: boolean }>(styled.a)`
  width: 100%;
  color: ${colors.colorCoreGray};
  position: absolute;
  bottom: 0;
  text-align: center;
  padding: 0;
  background: ${props => (props.inverse ? colors.colorWhite : colors.bgLight)};
  border-top: 1px solid ${colors.borderPrimary};
  z-index: 2;
  &:hover {
    cursor: pointer;
  }
  &:focus {
    outline: 0;
  }
`;

const HelperButtons = styledTS<{ isSidebarOpen?: boolean }>(styled.div)`
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: ${props =>
    props.isSidebarOpen ? `${dimensions.unitSpacing - 2}px` : '15px'};
  color: ${colors.colorCoreLightGray};
  padding-right: ${props => (props.isSidebarOpen ? '20px' : '0')};
  a, button {
    color: ${colors.colorCoreLightGray};
    text-transform: none;
    cursor: pointer;
    margin-left: ${dimensions.unitSpacing - 2}px;
    font-size: ${typography.fontSizeHeading8}px;
    font-weight: ${typography.fontWeightLight};
    outline: 0;
    padding: 0;
    border: none;
    background: none;
    > i {
      font-size: 16px;
      &:hover {
        color: ${colors.colorCoreBlack};
      }
    }
  }
`;

const SidebarCounter = styledTS<{ nowrap?: boolean; fullLength?: boolean }>(
  styled.div
)`
  font-size: ${typography.fontSizeHeading8}px;
  text-align: ${props => (props.nowrap ? 'right' : 'left')};
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ${props => !props.fullLength && 'ellipsis'};
  padding-left: 5px;
  a {
    padding: 0 !important;
    color: ${colors.linkPrimary};
  }
  span {
    float: right;
    margin-left: 5px;
  }
  ${props =>
    props.nowrap &&
    css`
      display: block;
      white-space: normal;
    `};
`;

const SidebarList = styledTS<{
  capitalize?: boolean;
  noTextColor?: boolean;
  noBackground?: boolean;
}>(styled.ul)`
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
    display: flex;
    padding: 6px 20px;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    text-transform: ${props => (props.capitalize ? 'capitalize' : 'normal')};
    outline: 0;
    border-left: 2px solid transparent;
    transition: background 0.3s ease;
    > i {
      margin-right: 5px;
    }
    &:hover,
    &.active {
      cursor: pointer;
      background: ${props => !props.noBackground && colors.bgActive};
      text-decoration: none;
      outline: 0;
      color: ${props => !props.noTextColor && lighten(colors.textPrimary, 40)};
    }
    &.active {
      background: ${rgba(colors.colorPrimary, 0.2)};
      color: ${colors.colorPrimary};
    }
    &.multiple-choice {
      flex-wrap: wrap;
      justify-content: space-between;
      white-space: normal;
      ${SidebarCounter} {
        max-width: 60%;
        word-break: break-word;
      }
    }
  }
  .icon {
    margin-right: 6px;
    color: ${colors.colorCoreGray};
  }
  button {
    font-size: 11px;
    padding-bottom: 0;
  }
`;

const FieldStyle = styledTS<{ overflow?: string }>(styled.div)`
  white-space: nowrap;
  overflow: ${props => (props.overflow ? props.overflow : 'hidden')};
  text-overflow: ellipsis;
  flex: 1;
`;

const CenterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  > a {
    border: 1px solid ${colors.colorWhite};
    color: ${colors.colorWhite};
  }
`;

const SectionContainer = styled.div`
  position: relative;

  > div {
    margin-bottom: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
  ${SidebarBox} {
    box-shadow: none;
  }
  ${SidebarTitle} {
    height: 40px;
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.colorSecondary};
    }
  }
`;

const SidebarCollapse = styled.a`
  color: ${colors.colorCoreGray};
  position: absolute;
  top: ${dimensions.unitSpacing - 2}px;
  right: ${dimensions.coreSpacing - 3}px;
  font-size: 14px;
  &:hover {
    cursor: pointer;
  }
  &:focus {
    outline: 0;
  }
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

const AuthWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex: auto;
  position: relative;
  background-color: #f0f0f0;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    overflow: auto;
    padding-bottom: ${dimensions.coreSpacing * 5}px;
  }
`;

const AuthBox = styled.div`
  position: relative;
  margin: auto;
  display: flex;
  flex: 1;
  min-height: 600px;
  max-height: 800px;
  border-radius: 32px;
  box-shadow: 0px 24px 32px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 0px 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AuthItem = styledTS<{ order?: number }>(styled.div)`
  position: relative;
  width: 50%;
  
  @media (max-width: 768px) {
    width: 100%;
    order: ${props => (props.order ? props.order : 0)};
  }
`;

const AuthContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex: 1;
  justify-content: center;
  background: ${colors.colorWhite};
`;

const AuthCustomDescription = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.colorPrimaryDark} url('/images/stars.png') repeat top
    center;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 70px;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent url('/images/twinkling.png') repeat top center;
    animation: ${twinkling} 200s linear infinite;
  }

  @media (max-width: 768px) {
    padding: 40px;
    overflow: hidden;
    padding-bottom: ${dimensions.coreSpacing * 5}px;
  }

  img {
    position: absolute;
    width: 100px;
    top: 100px;
  }

  h1 {
    position: relative;
    font-weight: bold;
    font-size: 48px;
    color: ${colors.colorWhite};
    margin: 0px;

    @media (max-width: 768px) {
      font-size: 38px;
    }
  }

  h2 {
    position: relative;
    font-size: 18px;
    color: ${colors.colorWhite};
    line-height: 1.5em;
    font-weight: 900;
    margin: 1.75em 0;

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }

  p {
    position: relative;
    color: ${colors.colorWhite};
    margin-bottom: 50px;
    font-size: 18px;
    line-height: 1.8em;
  }
`;

const AuthDescription = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.colorPrimaryDark} url('/images/stars.png') repeat top
    center;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 70px;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent url('/images/twinkling.png') repeat top center;
    animation: ${twinkling} 200s linear infinite;
  }

  @media (max-width: 768px) {
    padding: 40px;
    overflow: hidden;
    padding-bottom: ${dimensions.coreSpacing * 5}px;
  }

  img {
    position: relative;
    width: 100px;
    margin-bottom: 5%;
  }

  h1 {
    position: relative;
    font-weight: bold;
    font-size: 48px;
    color: ${colors.colorWhite};
    margin: 0px;

    @media (max-width: 768px) {
      font-size: 38px;
    }
  }

  h2 {
    position: relative;
    font-size: 28px;
    font-weight: 400;
    line-height: 1.5em;
    color: ${colors.colorWhite};

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }

  p {
    position: relative;
    color: ${colors.colorWhite};
    margin-bottom: 50px;
    font-size: 20px;
    line-height: 1.8em;
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

export {
  PageHeader,
  AuthWrapper,
  AuthBox,
  AuthItem,
  AuthCustomDescription,
  AuthDescription,
  AuthContent,
  MobileRecommend,
  VerticalContent,
  HeightedWrapper,
  Contents,
  MainHead,
  MainContent,
  ContentBox,
  ContenFooter,
  ContentHeader,
  HeaderContent,
  CenterContent,
  HeaderItems,
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
  SidebarList,
  FieldStyle,
  SectionContainer,
  SidebarCollapse,
  WhiteBoxRoot,
  WhiteBox,
  BarItems,
  SidebarFlexRow,
  FlexItem,
  FlexContent,
  FlexRightItem,
  SectionBodyItem
};
