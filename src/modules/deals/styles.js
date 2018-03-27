import styled, { css } from 'styled-components';
import { colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const stageWidth = 300;
const stageHeight = 'calc(100vh - 200px)';
const coreHeight = 50;

const PipelineContainer = styled.div`
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 8px 0px ${colors.colorShadowGray};

  &:not(:first-child) {
    margin-top: 20px;
  }
`;

const PipelineHeader = styled.div`
  width: 100%;
  height: ${coreHeight}px;
  padding: 0 20px;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.colorShadowGray};

  h2 {
    margin: 0;
    padding: 0;
    line-height: ${coreHeight - 2}px;
    font-weight: normal;
    font-size: 13px;
    color: ${colors.colorCoreDarkGray};
  }
`;

const PipelineBody = styled.div`
  overflow-x: auto;

  > div:not([class]) {
    display: inline-flex;
  }
`;

const StageWrapper = styled.div`
  display: flex;
  border-right: 1px solid ${colors.colorShadowGray};
  flex-direction: column;
  width: ${stageWidth}px;
  max-height: ${stageHeight};
`;

const StageContainer = styled.div`
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
  height: 100%;
  ${props => css`
    background: ${props.isDragging ? colors.colorWhite : 'none'};
    box-shadow: ${props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.14)`
      : 'none'};
  `};
`;

const StageHeader = styled.div`
  padding: 10px 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
  position: relative;

  &:after,
  &:before {
    position: absolute;
    content: '';
    top: 50%;
    height: 0;
    width: 0;
  }

  &:after {
    border-top: 13px solid transparent;
    border-bottom: 13px solid transparent;
    border-left: 9px solid #fff;
    right: -9px;
    margin-top: -13px;
  }

  &:before {
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 10px solid ${colors.colorShadowGray};
    right: -10px;
    margin-top: -15px;
  }

  h3 {
    margin: 0;
    font-size: 12px;
    line-height: inherit;
    text-transform: uppercase;

    span {
      color: ${colors.colorCoreGray};
      margin-left: 5px;
      font-size: 90%;
    }
  }
`;

const StageAmount = styled.ul`
  list-style: none;
  margin: 5px 0 0;
  overflow: hidden;
  padding: 0;

  li {
    float: left;
    padding-right: 5px;
    font-size: 12px;

    span {
      font-weight: bold;
      font-size: 10px;
    }

    &:after {
      content: '/';
      margin-left: 5px;
    }

    &:last-child:after {
      content: '';
    }
  }
`;

const StageBody = styled.div`
  padding: 10px;
  height: 100%;
  overflow: auto;
`;

const StageDropZone = styled.div`
  height: 100%;

  > div:not(.deals) {
    background: #eee;
    border-radius: 5px;
  }
`;

const AddNewDeal = styled.a`
  display: block;
  height: ${coreHeight}px;
  line-height: ${coreHeight - 2}px;
  text-align: center;
  border: 1px dashed ${colors.colorShadowGray};
  border-radius: 5px;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 10px;

  &:hover {
    background: ${colors.bgLight};
  }

  i {
    margin-right: 8px;
  }
`;

const DealContainerHover = styled.div`
  position: absolute;
  opacity: 0;
  z-index: 1;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
  cursor: pointer;

  > div {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 15px;
  }
`;

const DealContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid ${colors.borderPrimary};
  background-color: ${colors.bgLight};
  position: relative;
  transition: box-shadow 0.3s ease-in-out;
  box-shadow: ${props =>
    props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.15)`
      : '0 1px 5px 0 rgba(45, 60, 80, 0.1)'};

  &:hover {
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.15);
  }

  &:hover ${DealContainerHover} {
    opacity: 1;
  }
`;

const DealSectionContainer = styled.div`
  padding: 10px 10px 0px 10px;
  border-top: 1px solid ${colors.borderPrimary};
`;

const DealDate = styled.span`
  font-size: 11px;
  background: ${rgba(colors.colorCoreRed, 0.8)};
  color: #fff;
  padding: 1px 5px;
  border-radius: 2px;
`;

const DealFooter = styled.div`
  position: relative;
  padding-right: 40px;
`;

const ItemCounterContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: block;
  overflow: hidden;

  > li {
    float: left;
    border-radius: 12px;
    padding: 3px 10px;
    margin-right: 5px;
    margin-bottom: 5px;
    color: ${colors.colorWhite};
    background: ${colors.colorCoreBlue};
    text-transform: uppercase;
    font-size: 9px;
  }
  .remained-count {
    background: #a3a7ac;
  }
`;

const ItemName = styled.div`
  line-height: 36px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const DealAmount = styled.div`
  margin-top: 10px;

  p {
    margin-bottom: 0;

    span {
      font-size: 10px;
      font-weight: bold;
    }
  }
`;

const DealFormAmount = styled.div`
  margin-top: 10px;
  p {
    margin-bottom: 0;
    font-weight: bold;
  }
`;

const DealFormContainer = styled.form`
  padding: 20px;
  border-radius: 5px;
  border: 1px dashed ${colors.colorShadowGray};
  background-color: #f6f6f6;

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 17px 14px;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }

  textarea {
    height: 62px;
  }
`;

const DealButton = styled.div`
  padding: 7px 10px;
  margin-bottom: 15px;
  background: ${colors.colorWhite};
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid ${colors.borderPrimary};
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.bgLight};
  }

  i {
    float: right;
  }
`;

const UserCounterContainer = styled.ul`
  position: absolute;
  right: 0;
  margin-bottom: 0;
  list-style: none;
  padding: 0;
  bottom: -2px;

  li {
    float: left;
    border: 2px solid ${colors.colorWhite};
    width: 28px;
    height: 28px;
    line-height: 24px;
    border-radius: 14px;
    background: #a3a7ac;
    text-align: center;
    color: ${colors.colorWhite};
    overflow: hidden;
    margin-left: -12px;

    img {
      width: 100%;
      vertical-align: top;
    }
  }
`;

const ProductFormContainer = styled.div`
  background: ${colors.colorWhite};
  margin: -40px -40px -30px -40px;
`;

const ProductFooter = styled.div`
  padding: 20px;
  background: ${colors.bgActive};
`;

const FooterInfo = styled.div`
  overflow: hidden;
  padding-bottom: 10px;
  > div {
    &:first-child {
      float: left;
      width: 60%;
    }
  }
  table {
    float: right;
    width: 30%;
    td {
      vertical-align: top;
      padding: 5px;
    }
  }
`;

const AddProduct = styled.div`
  display: block;
  padding: 20px;
  text-align: center;
  border-top: 1px solid ${colors.borderPrimary};
`;

const ProductItemText = styled.div`
  height: 34px;
  line-height: 34px;
  font-weight: bold;
  padding-left: 10px;
  text-align: ${props => props.align || 'left'};
`;

const QuickEditContainer = styled.div`
  position: fixed;
  top: 0;
  left: 70px;
  z-index: 2;
  width: 100%;
  height: 100%;
  background: ${rgba(colors.colorCoreDarkGray, 0.5)};

  > div {
    position: absolute;
    top: ${props => props.top && `${props.top}px`};
    bottom: 10px;
    left: ${props => `${props.left - 70}px`};

    ${DealFormContainer} {
      float: left;
      width: ${stageWidth - 30}px;
      overflow: auto;
      max-height: 100%;
    }
  }
`;

const RightControls = styled.div`
  float: left;
  margin-left: 10px;

  button {
    display: block;
    background: ${rgba(colors.colorCoreDarkGray, 0.9)};
    margin: 0 0 10px 0;
    color: ${colors.colorWhite};
    text-transform: none;
  }
`;

const DealMoveFormContainer = styled.div`
  position: absolute;
  top: 32px;
  left: ${stageWidth - 20}px;
  background: ${colors.colorWhite};
  width: 240px;
  padding: 20px;
`;

const Footer = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const Indicator = styled.div`
  display: flex;
  margin-top: 5px;

  > div {
    margin-right: 4px;

    &:last-of-type {
      margin: 0;
    }
  }
`;

const IndicatorItem = styled.div`
  flex: 1;
  background: ${props =>
    props.isPass ? colors.colorCoreTeal : colors.colorShadowGray};
  height: 4px;
  border-radius: 10px;
`;

export {
  PipelineContainer,
  PipelineHeader,
  PipelineBody,
  StageWrapper,
  StageContainer,
  StageHeader,
  StageAmount,
  StageBody,
  StageDropZone,
  AddNewDeal,
  DealContainer,
  DealSectionContainer,
  DealContainerHover,
  DealFooter,
  DealDate,
  DealAmount,
  DealFormAmount,
  ItemCounterContainer,
  DealFormContainer,
  DealButton,
  UserCounterContainer,
  ProductFormContainer,
  ProductFooter,
  FooterInfo,
  AddProduct,
  ProductItemText,
  QuickEditContainer,
  RightControls,
  DealMoveFormContainer,
  Footer,
  ItemName,
  Indicator,
  IndicatorItem
};
