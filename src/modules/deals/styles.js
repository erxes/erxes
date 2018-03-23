import styled, { css } from 'styled-components';
import { colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const StageWidth = 300;

const PipelineContainer = styled.div`
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 8px 0px ${colors.colorShadowGray};

  &:not(:first-child) {
    margin-top: 20px;
  }
`;

const PipelineHeader = styled.div`
  width: 100%;
  height: 50px;
  padding: 0 20px;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.colorShadowGray};
  h2 {
    margin: 0;
    padding: 0;
    line-height: 50px;
    font-weight: normal;
    font-size: 13px;
    color: ${rgba(colors.colorCoreDarkGray, 0.9)};
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
  width: ${StageWidth}px;
`;

const StageContainer = styled.div`
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
  flex: 1;
  ${props => css`
    background: ${props.isDragging ? colors.colorWhite : 'none'};
    box-shadow: ${props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.14)`
      : 'none'};
  `};
`;

const StageHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
  > div {
    line-height: 18px;
    display: flex;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 13px;
      text-transform: uppercase;
    }
    .deals-count {
      text-transform: capitalize;
    }
  }
`;

const StageAmount = styled.ul`
  float: right;
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  li {
    float: left;
    padding-left: 5px;
    font-weight: bold;
    font-size: 12px;

    &:before {
      content: '/';
      margin-right: 5px;
    }

    &:first-child:before {
      content: '';
    }
  }
`;

const StageBody = styled.div`
  padding: 10px;
  height: 100%;
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
  height: 60px;
  line-height: 60px;
  text-align: center;
  border: 1px dashed ${colors.colorShadowGray};
  border-radius: 5px;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${colors.bgLight};
  }

  i {
    margin-right: 8px;
    font-size: 15px;
  }
`;

const DealContainerHover = styled.div`
  position: absolute;
  opacity: 0;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${rgba(colors.colorCoreLightGray, 0.2)};
  transition: all 0.3s ease;

  > div {
    position: absolute;
    top: 30px;
    right: 15px;
    font-size: 15px;
    cursor: pointer;
    padding: 5px;
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
  box-shadow: ${props =>
    props.isDragging ? `0 0 20px 2px rgba(0, 0, 0, 0.13)` : 'none'};

  &:hover ${DealContainerHover} {
    opacity: 1;
  }
`;

const DealDate = styled.span`
  position: absolute;
  right: 15px;
  font-size: 12px;
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
    padding: 5px 10px;
    margin-right: 5px;
    color: ${colors.colorWhite};
    background: ${colors.colorSecondary};
    text-transform: uppercase;
    font-size: 9px;
  }
  .remained-count {
    background: #a3a7ac;
  }
`;

const DealAmount = styled.div`
  float: left;
  margin-top: 10px;

  p {
    margin-bottom: 0;

    span {
      font-size: 11px;
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
  border: 1px dotted ${colors.colorShadowGray};
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
`;

const DealButton = styled.div`
  padding: 7px 10px;
  margin-bottom: 15px;
  background: ${colors.colorWhite};
  border-radius: 5px;
  cursor: pointer;
  i {
    float: right;
  }
`;

const UserCounterContainer = styled.ul`
  float: right;
  margin-top: 20px;
  margin-bottom: 0;
  list-style: none;
  padding: 0;

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
  padding: 30px;
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
  height: 80px;
  line-height: 80px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  background: #ebebeb;
  color: #5fa3b8;
  cursor: pointer;
  i {
    padding-right: 8px;
  }
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
      width: ${StageWidth - 30}px;
      overflow: auto;
      height: 100%;
    }
  }
`;

const RightControls = styled.div`
  float: left;
  margin-left: 10px;
  button {
    display: block;
    background: ${rgba(colors.colorCoreDarkGray, 0.9)};
    padding: 5px 10px;
    margin: 0 0 10px 0;
    border-radius: 10px;
    color: ${colors.colorWhite};
    text-transform: none;
    i {
      font-size: 10px;
    }
  }
`;

const DealMoveFormContainer = styled.div`
  position: absolute;
  top: 32px;
  left: ${StageWidth - 20}px;
  background: ${colors.colorWhite};
  width: 240px;
  padding: 20px;
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
  DealContainerHover,
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
  DealMoveFormContainer
};
