import { colors, dimensions, typography } from "../styles";
import { lighten, rgba } from "../styles/ecolor";
import styled, { css } from "styled-components";

import styledTS from "styled-components-ts";

const columnSizing = "20px";
const borderRadius = "2px";

const CenterContent = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const FormContainer = styled.div`
  margin: 20px;

  .Select-multi-value-wrapper {
    display: flex;
    min-width: 100px;
  }

  .Select-clear {
    line-height: 1;
  }

  .Select--single > .Select-control .Select-value {
    max-width: 135px;
  }
`;

const Title = styledTS<{ full?: boolean }>(styled.h4)`
  margin: 0 0 ${columnSizing} 0;
  background: ${colors.bgActive};
  padding: 10px ${columnSizing};
  white-space: ${props => (props.full ? "normal" : "nowrap")};
  font-size: 12px;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    opacity: 0.7;
    margin-left: 10px;
  }
`;
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    display: block;
    text-align: left;

    a,
    span {
      color: ${colors.linkPrimary};
      cursor: pointer;
    }
  }
`;

const ActionTop = styled.div`
  display: flex;

  > * {
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const Column = styledTS<{ lastChild?: boolean; width?: string }>(styled.div)`
  flex: ${props => (props.lastChild ? 3 : 4)};
  position: relative;
  ${props => (props.width ? `width: ${props.width}` : null)}
  margin-left: ${props => props.lastChild && columnSizing};
  padding-left: ${props => props.lastChild && columnSizing};
  border-left: ${props =>
    props.lastChild && `1px solid ${colors.borderDarker}`};

  > input {
    margin-bottom: ${columnSizing};
  }

  ul {
    height: 40vh;
    overflow: auto;
    padding: 0 10px 0 0;
    margin: 20px 0 0 0;
    list-style-type: none;

    li {
      padding: 6px 40px 6px ${columnSizing};
      position: relative;
      margin-bottom: 6px;
      border: 1px solid ${colors.borderDarker};
      border-radius: ${borderRadius};
      transition: all 0.3s ease;
      text-overflow: ellipsis;
      overflow: hidden;

      > i {
        position: absolute;
        right: -1px;
        top: -1px;
        bottom: -1px;
        width: 0;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        display: flex;
        background: ${colors.colorCoreGreen};
        border-radius: ${borderRadius};
        color: ${colors.colorWhite};
        transition: all 0.3s ease;
      }

      &:hover {
        cursor: pointer;
        background: ${colors.bgActive};

        > i {
          width: 34px;
        }
      }
    }
  }

  &:last-of-type {
    flex: 3;
    margin-left: ${columnSizing};
    padding-left: ${columnSizing};
    border-left: 1px solid ${colors.borderDarker};

    li {
      font-weight: bold;

      > i {
        background: ${colors.colorCoreRed};
      }
    }
  }

  &.multiple:first-child {
    margin-right: ${columnSizing};
  }
`;

const TypeBox = styledTS<{ color: string }>(styled.div)`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${props => props.color};
  color: white;
  line-height: 28px;
  text-align: center;
  margin-right: 10px;
  font-size: 14px;
  flex-shrink: 0;
`;

const Add = styled.div`
  display: block;
  margin: ${dimensions.coreSpacing}px;
  text-align: center;
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

const CustomField = styled.div`
  text-align: left;
  padding: ${dimensions.unitSpacing}px;
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
  margin: 0 0px;
  text-transform: uppercase;
  position: relative;
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
    props.isSidebarOpen ? `${dimensions.unitSpacing - 2}px` : "15px"};
  color: ${colors.colorCoreLightGray};
  padding-right: ${props => (props.isSidebarOpen ? "20px" : "0")};
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
  text-align: ${props => (props.nowrap ? "right" : "left")};
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ${props => !props.fullLength && "ellipsis"};
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
    text-transform: ${props => (props.capitalize ? "capitalize" : "normal")};
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

const SectionBodyItem = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  word-break: break-word;
  > a {
    padding: 10px 0px;
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

const ProductName = styled.a`
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;

  > i {
    visibility: hidden;
  }

  &:hover i {
    visibility: visible;
  }
`;

const TabContainer = styledTS<{ grayBorder?: boolean; full?: boolean }>(
  styled.div
)`
  border-bottom: 1px solid
    ${props => (props.grayBorder ? colors.borderDarker : colors.borderPrimary)};
  margin-bottom: -1px;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: ${props => props.full && "space-evenly"};
  flex-shrink: 0;
  height: ${dimensions.headerSpacing}px;
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
  width: ${props => (props.wide ? "340px" : "290px")};
  flex: ${props => (props.half ? "1" : "none")};
  background: ${props => (props.full ? colors.colorWhite : "none")};
  margin: 0 ${dimensions.unitSpacing}px;
  margin: ${props => props.hasBorder && 0};
  border-right: ${props =>
    props.hasBorder && `1px solid ${colors.borderPrimary}`};
  box-shadow: ${props =>
    props.full ? `0 0 6px 1px ${colors.shadowPrimary}` : "none"};

  ${TabContainer} {
    position: sticky;
    top: 0;
    background: ${colors.colorWhite};
  }
`;

export {
  SidebarHeader,
  SidebarMainContent,
  SidebarFooter,
  SidebarBox,
  SidebarToggle,
  SidebarCounter,
  SidebarTitle,
  SidebarList,
  SidebarCollapse,
  SectionContainer,
  SectionBodyItem,
  BoxContent,
  HelperButtons,
  CustomField,
  ProductName,
  SideContent,
  Add,
  FooterInfo,
  FormContainer,
  TypeBox,
  ActionTop,
  Footer,
  Columns,
  Column,
  CenterContent,
  Title
};
