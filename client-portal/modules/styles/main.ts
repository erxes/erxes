import { colors, dimensions, typography } from "../styles";
import styled, { css } from "styled-components";

import { rgba } from "../styles/ecolor";
import styledTS from "styled-components-ts";
import { Input } from "./form";

const Header = styledTS<{
  color?: string;
  background?: string;
  backgroundImage?: string;
  headingSpacing?: boolean;
}>(styled.div)`
  padding: ${props => (props.headingSpacing ? "30px 30px 80px" : "30px 0")};
  color: ${props => (props.color ? props.color : colors.colorWhite)};
  font-size: ${typography.fontSizeBody}px;
  background-color: ${props =>
    props.background ? props.background : "#f5f8fb"};
  background-image: ${props =>
    props.backgroundImage && `url(${props.backgroundImage})`};
  position: relative;
  border-radius: 0 0 30px 30px;

  h3 {
    font-size: 1.75rem;
    font-weight: ${typography.fontWeightRegular};
    margin: 30px 0;

    @media (max-width: 700px) {
      margin: 0 0 ${dimensions.coreSpacing}px 0;
    }
  }

  .modal-content {
    background: transparent;
    border: 0;
  }

  &:after, &:before {
    content: '';
    position: absolute;
    top: 0;
    left: auto;
    right: 0;
    bottom: 0;
    width: 30%;
    background-image: url('/static/cp_header_bg.png');
    background-repeat: no-repeat;
    background-size: cover;
  }

  &:before {
    left: 0;
    top: 60%;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;

    > div {
      flex: 1;
      margin-bottom: ${dimensions.coreSpacing}px;
    }
  }
`;

const HeaderLogo = styled.div`
  display: flex;
  align-items: center;

  img {
    max-height: 40px;
    cursor: pointer;
  }
`;

const HeaderTitle = styledTS<{ color?: string }>(styled.span)`
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid ${props =>
    props.color ? props.color : colors.colorWhite};
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: capitalize;
`;

const HeaderRight = styled.div`
  display: flex;

  @media (max-width: 700px) {
    width: 100%;
    justify-content: center;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const SupportMenus = styledTS<{ color?: string; baseColor?: string }>(
  styled.div
)`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  position: relative;

  .dropdown {
    cursor: pointer;
  }

  .dropdown-menu {
    min-width: 210px;
    right: -50px;
    left: auto !important;
    top: 35px !important;
    transform: none !important;
  }

  > button {
    color: ${props =>
      props.color ? props.color : colors.colorWhite} !important;
    border: 1px solid transparent;

    &.ghost {
      color: ${props =>
        props.baseColor ? props.baseColor : colors.textPrimary} !important;
    }

    &:focus {
      outline: none;
    }
  }
`;

const NotificationsBadge = styled.div`
  cursor: pointer;
  position: relative;
  margin-right: ${dimensions.coreSpacing - 5}px;

  > span {
    position: absolute;
    right: -5px;
    left: auto;
    top: -5px;
    background: ${colors.colorCoreRed};
    width: 20px;
    height: 20px;
  }
`;

const WebLink = styled.a`
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;
`;

const HeaderLinks = styled.div`
  text-align: right;

  @media (max-width: 700px) {
    text-align: left;
  }
`;

const LinkItem = styledTS<{ active?: boolean; color?: string }>(styled.span)`
  display: inline-block;
  padding-right: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
  font-size: 14px;
  opacity: 0.9;
  text-transform: capitalize;
  position: relative;
  transition: all ease 0.3s;

  &:last-child {
    margin-right: 0;
    border-right: 0;
  }

  border-bottom: 2px solid transparent;

  ${props =>
    props.active &&
    `
    font-weight: 600;
    opacity: 1;

    &:after {
      content: '.';
      position absolute;
      bottom: -15px;
      left: 45%;
      font-size: 25px;
    }
  `}

  &:hover {
    opacity: 1;
  }

  @media (max-width: 700px) {
    margin: 0 0 ${dimensions.unitSpacing}px 5px;
  }
`;

const MainContent = styledTS<{ baseColor?: string; bodyColor?: string }>(
  styled.div
)`
  background-color: ${props => (props.bodyColor ? props.bodyColor : "#f5f8fb")};
  min-height: 60vh;
  padding: 32px 0;

  ${props =>
    props.baseColor &&
    css`
      .base-color {
        color: ${props.baseColor} !important;
      }
    `};
`;

const Container = styledTS<{
  transparent?: boolean;
  shrink?: boolean;
  large?: boolean;
}>(styled.div)`
  width: ${props =>
    props.large
      ? dimensions.wrapperWidth + dimensions.coreSpacing
      : dimensions.wrapperWidth + dimensions.unitSpacing}%;
  margin: 0 auto;
  position: relative;
  z-index: 3;

  ${props =>
    !props.shrink &&
    css`
      height: 100%;
      height: calc(100% - 20px);
    `};
  
  @media (max-width: 1200px) {
    width: 80%;
  }

  @media (max-width: 800px) {
    width: 90%;
  }
`;

const BottomComponent = styledTS<{ transparent?: boolean }>(styled.div)`
  width: ${dimensions.wrapperWidth + dimensions.unitSpacing}%;
  margin: 70px auto 0;
  text-align: center;

  @media (max-width: 1200px) {
    width: 80%;
  }

  @media (max-width: 800px) {
    width: 90%;
    margin: 0 auto;
  }
`;

const BoxRoot = styledTS<{ selected?: boolean }>(styled.div)`
  text-align: center;
  float: left;
  background: ${colors.colorLightBlue};
  box-shadow: ${props =>
    props.selected
      ? `0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)}`
      : `0 6px 10px 1px ${rgba(colors.colorCoreGray, 0.08)}`} ;
  margin-right: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing / 2 - 1}px;
  transition: all 0.25s ease;
  border: 1px solid
    ${props => (props.selected ? colors.colorSecondary : colors.borderPrimary)};

  > a {
    display: block;
    padding: ${dimensions.coreSpacing}px;
    text-decoration: none;

    &:focus {
      text-decoration: none;
    }
  }

  img {
    width: 83px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    span {
      font-weight: 500;
    }

    img {
      transform: scale(1.1);
    }
  }

  @media (max-width: 780px) {
    width: 100%;
  }
`;

const SearchContainer = styledTS<{ focused: boolean }>(styled.div)`
  position: relative;
  width: 80%;
  margin: 0 auto;

  ${props =>
    props.focused &&
    css`
      i {
        color: ${colors.colorCoreGray};
      }
    `};

  input {
    width: 100%;
    border: 1px solid #ddd;
    background: rgba(255,255,255,.9);
    font-size: 18px;
    border-radius: 100px;
    padding: 15px 40px 15px 55px;
    color: ${colors.textSecondary};
    transition: all 0.3s linear;

    &:focus,
    &:active {
      background: ${colors.colorWhite};
      color: ${colors.textSecondary};
    }

    &::placeholder {
      color: ${colors.colorLightGray};
      font-weight: 400;
    }
  }

  i {
    position: absolute;
    color: ${colors.colorCoreLightGray};
    top: 5px;
  }

  i:nth-child(1) {
    left: ${dimensions.unitSpacing + 5}px;
  }

  .icon-times-circle {
    right: 20px;
    cursor: pointer;
    z-index: 2;
    top: ${dimensions.unitSpacing}px;
  }
`;

const Footer = styledTS<{ color?: string; backgroundImage?: string }>(
  styled.div
)`
  background-color: ${props =>
    props.color ? props.color : colors.colorPrimary};
  padding: 40px 0;
  color: ${colors.colorWhite};
  text-align: center;

  h4 {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 1px;
  }

  p {
    color: rgba(255,255,255,.7);
    font-size: 14px;
    width: 500px;
    margin: 0 auto;
    margin-bottom: 20px;
  }
`;

const FooterLink = styled.a`
  width: 32px;
  height: 32px;
  margin: 5px 5px 0px 5px;
  border-radius: 16px;
  display: inline-block;
  background: #fff;
  transition: background 0.3s ease;
  font-size: 14px;
  padding: 6px;

  img {
    width: 100%;
    filter: contrast(0) sepia(100%) hue-rotate(0deg) brightness(0.4) saturate(0);
  }

  &:hover {
    background: #eee;
  }
`;

const ModalWrapper = styledTS<{ isFull?: boolean }>(styled.div)`
  .client-modal {
    position: fixed;
    overflow: auto;
    z-index: 9;
    background: rgba(48, 67, 92, .6);
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;

    > div {
      position: relative;
      z-index: 99;
      width: 60%;
      max-width: ${props => (props.isFull ? "900px" : "600px")};
      border-radius: 2px;
      margin: 100px auto;

      @media (max-width: 700px) {
        width: 90%;
      }
    }

    @media (max-width: 700px) {
      overflow-x: hidden;
     }
  }
`;

const ModalClose = styled.div`
  position: absolute;
  right: 30px;
  top: 20px;
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.3);
  line-height: 30px;
  border-radius: 15px;
  text-align: center;
  color: #fff;
  cursor: pointer;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

  h4 {
    text-transform: uppercase;
    font-size: 18px;
    margin: 0;
  }

  @media (max-width: 700px) {
    > div {
      margin-top: 20px;

      .dropdown {
        flex: 1;
      }
    }
  }
`;

const FormWrapper = styled.div`
  background: ${colors.colorWhite};
  border-radius: 5px;
  color: #444;

  .customFieldDescription {
    font-size: 13px;
    margin-bottom: 10px;
    color: ${colors.colorCoreGray};
  }

  h4 {
    color: ${colors.textPrimary};
    font-weight: 600;
    font-size: 18px;
    padding: 20px 40px;
    border-radius: 5px 5px 0 0;
    background: ${colors.bgLight};
    border-bottom: 1px solid #eee;
    margin: 0;
  }

  .content {
    padding: 20px 40px;

    > div:last-child {
      margin-bottom: 10px;
    }

    .right {
      text-align: right;
    }
  }
`;

const Badge = styled.span`
  border-radius: 15px;
  background-color: ${props => props.color};
  font-size: 11px;
  max-width: 50px;
  color: white;
  text-align: center;
`;

const NotificationContent = styledTS<{ isList?: boolean }>(styled.div)`
  background: ${colors.bgMain};
  padding: ${dimensions.unitSpacing - 5}px ${dimensions.unitSpacing}px;
  border-radius: 3px;
  margin: ${dimensions.unitSpacing - 5}px 0;
  word-break: break-word;
  max-width: ${props => (props.isList ? "100%" : "270px")};

  > p {
    margin: 0;
  }
`;

const Content = styledTS<{ isList?: boolean }>(styled.div)`
  background: ${colors.bgMain};
  padding: ${dimensions.unitSpacing - 5}px ${dimensions.unitSpacing}px;
  border-radius: 3px;
  margin: ${dimensions.unitSpacing - 5}px 0;
  word-break: break-word;
  max-width: ${props => (props.isList ? "100%" : "270px")};

  > p {
    margin: 0;
  }
`;

const NotificationHeader = styled.div`
  background: ${colors.colorSecondary};
  padding: ${dimensions.coreSpacing}px;
  color: ${colors.colorWhite};

  h5 {
    margin: 0;
    font-size: 16px;
  }

  span {
    color: #f3f6f9;
    background-color: rgba(243, 246, 249, 0.1);
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 700;
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
  text-transform: ${props => props.uppercase && "uppercase"};
  font-weight: ${props => (props.bold ? "bold" : "500")};
  display: flex;
  font-size: ${typography.fontSizeHeading8}px;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px ${dimensions.coreSpacing}px;
`;

const SidebarTitle = styledTS<{
  children: any;
}>(styled(SidebarHeader.withComponent("h3")))`
  padding: 0;
  margin: 0px ${dimensions.coreSpacing}px;
  text-transform: uppercase;
  position: relative;
  `;

const SidebarBox = styledTS<{
  noBackground?: boolean;
  noShadow?: boolean;
  collapsible?: boolean;
  full?: boolean;
  noMargin?: boolean;
}>(styled.div)`
    background-color: ${props => (props.noBackground ? "" : colors.colorWhite)};
    margin-bottom: ${props => !props.noMargin && dimensions.unitSpacing}px;
    box-shadow: ${props =>
      props.noShadow ? "none" : `0 0 6px 1px ${colors.shadowPrimary}`};
    padding-bottom: ${props =>
      props.collapsible ? `${dimensions.unitSpacing}px` : "0"};
    position: ${props => (props.full ? "initial" : "relative")};
    justify-content: center;
    transition: max-height 0.4s;
    overflow: ${props => (props.collapsible ? "hidden" : "initial")};
    display: ${props => props.full && "flex"};
    &:last-child {
      margin-bottom: 0;
    }
  `;

const SectionContainer = styledTS<{ hasShadow?: boolean }>(styled.div)`
  position: relative;
  margin-bottom: ${dimensions.unitSpacing}px;
  box-shadow: ${props => props.hasShadow && "rgb(0 0 0 / 8%) 0px 0px 6px 0px"};

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

const tableHoverColor = "#f5f5f5";

const FormLabel = styled.label`
  position: relative;
  display: inline-block;
  font-weight: normal;

  span {
    cursor: pointer;
    display: inline-block;
  }
`;

const StyledTable = styledTS<{
  whiteSpace?: string;
  alignTop?: boolean;
  hover?: boolean;
  bordered?: boolean;
  striped?: boolean;
  wideHeader?: boolean;
}>(styled.table)`
  ${props => css`
    width: 100%;
    max-width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    white-space: ${props.whiteSpace || ""};

    tr {
      margin: 0 20px;
    }

    th,
    td {
      border-top: 1px solid ${colors.borderPrimary};
      color: ${colors.textPrimary};
      padding: ${dimensions.unitSpacing - 2}px;
      display: table-cell;
      vertical-align: ${props.alignTop && "top"};

      & ${FormLabel}, & ${Input} {
        margin: 0px;
      }

      &:first-child {
        padding-left: 0;
      }
    }

    thead {
      th,
      td {
        text-transform: uppercase;
        font-size: ${typography.fontSizeUppercase}px;
      }

      th {
        background-color: ${colors.colorWhite};
        margin-left: 20px;
        position: sticky;
        z-index: 1;
        top: 0;
      }
    }

    ${props.hover
      ? `tr:hover td { background-color: ${tableHoverColor}; }`
      : null} ${props.bordered
      ? `th, td { border-bottom: 1px solid ${colors.borderPrimary}; }`
      : null} ${props.striped
      ? `tr:nth-of-type(odd) td { background-color: ${colors.bgLightPurple}; }`
      : null} th {
      border-top: none;
    }

    th:first-child,
    td:first-child {
      border-left: none;
    }

    th:last-child,
    td:last-child {
      border-right: none;
      text-align: right;
    }

    td.with-input {
      text-align: center;
    }

    .with-input input {
      width: 40px;
      text-align: center;
      outline: 0;
      border: 1px solid ${colors.borderDarker};
      border-radius: 2px;
      font-size: 12px;
      height: 24px;
    }

    @media (min-width: 1170px) {
      th,
      td {
        padding: ${props =>
            props.wideHeader
              ? `${dimensions.unitSpacing + 2}px`
              : `${dimensions.unitSpacing - 2}`}
          ${dimensions.coreSpacing - 2}px;

        &:last-child {
          padding-right: ${dimensions.coreSpacing}px;
        }
      }
    }
  `};
`;

const TableWrapper = styled.div`
  table thead tr th {
    font-size: 10px;
  }
`;

const FooterInfo = styled.div`
  overflow: hidden;

  table {
    text-align: right;
    float: right;
    width: 50%;
    font-size: 14px;
  }
`;

const NotificationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 400px;
  overflow: auto;

  li {
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
    border-bottom: 1px solid ${colors.bgActive};
    position: relative;
    display: flex;

    &:last-child {
      border: none;
    }

    &.unread {
      background: #edf2fa;
      border-color: #e3e9f3;

      ${Content} {
        background: ${colors.colorWhite};
      }
    }

    &:hover,
    &:focus {
      background: ${colors.bgLight};
      cursor: pointer;
    }
  }
`;

const InfoSection = styled.div`
  position: relative;
  flex: 1;
  font-size: 13px;

  p {
    margin: 0;
  }
`;

const CreatedDate = styledTS<{ isList?: boolean }>(styled.div)`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  padding-top: 3px;

  ${props =>
    props.isList &&
    css`
      position: absolute;
      right: 0;
      top: 5px;
    `}
`;

const AuthContainer = styled.div`
  button {
    &.border {
      border: 1px solid ${colors.colorWhite};
    }
  }
`;

export {
  Header,
  HeaderTop,
  HeaderLogo,
  HeaderTitle,
  HeaderRight,
  HeaderLeft,
  SupportMenus,
  WebLink,
  HeaderLinks,
  MainContent,
  Container,
  BoxRoot,
  SearchContainer,
  Footer,
  FooterLink,
  BottomComponent,
  LinkItem,
  ModalWrapper,
  ModalClose,
  HeaderWrapper,
  FormWrapper,
  Badge,
  NotificationContent,
  NotificationsBadge,
  Content,
  NotificationList,
  NotificationHeader,
  InfoSection,
  CreatedDate,
  AuthContainer,
  StyledTable,
  TableWrapper,
  FooterInfo
};
