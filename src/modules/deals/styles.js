import styled from 'styled-components';
import { colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const StageWidth = 300;
const StageHeight = 'calc(100vh - 233px)';

const PipelineContainer = styled.div`
  background-color: ${colors.colorWhite};
  &:not(:first-child) {
    margin-top: 20px;
  }
`;

const PipelineHeader = styled.div`
  width: 100%;
  height: 85px;
  padding: 0 30px;
  border-bottom: 1px solid ${colors.colorShadowGray};
  h2 {
    margin: 0;
    padding: 0;
    line-height: 85px;
    font-weight: normal;
    font-size: 20px;
    color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  }
`;

const PipelineBody = styled.div`
  overflow-x: auto;
  > div {
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
  min-height: ${StageHeight};
  background: ${({ isDragging }) =>
    isDragging ? rgba(colors.colorCoreDarkGray, 0.2) : 'none'};
  transition: background-color 0.1s ease;
`;

const StageHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${colors.colorShadowGray};
  > div {
    line-height: 18px;
    display: flex;
    justify-content: space-between;
    h3 {
      margin: 0;
      font-size: 18px;
      text-transform: uppercase;
    }
    .deals-count {
      text-transform: capitalize;
      color: #585278;
      font-size: 16px;
      font-weight: bold;
    }
  }
  ul {
    float: right;
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    li {
      float: left;
      padding-left: 5px;
      color: #585278;
      font-size: 14px;
      font-weight: bold;
    }
  }
`;

const StageBody = styled.div`
  padding: 10px 15px 30px;
`;

const StageDropZone = styled.div`
  padding: 10px 0;
`;

const EmptyStage = styled.div`
  display: flex;
  flex-direction: column;
  width: ${StageWidth}px;
  min-height: ${StageHeight};
`;

const AddNewDeal = styled.a`
  display: block;
  height: 70px;
  line-height: 70px;
  text-align: center;
  border: 1px dotted ${colors.colorShadowGray};
  border-radius: 5px;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  font-size: 14px;
  cursor: pointer;
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
  background: ${rgba(colors.colorCoreDarkGray, 0.2)};
  > div {
    float: right;
    padding: 25px 25px 0 0;
    font-size: 15px;
  }
`;

const DealContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin: 10px 0;
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid ${colors.colorShadowGray};
  background-color: #f6f6f6;
  &:hover ${DealContainerHover} {
    opacity: 1;
  }
`;

const DealHeader = styled.div`
  overflow: hidden;
  margin-bottom: 10px;
  h4 {
    margin: 0;
    float: left;
    color: #2795ff;
    font-size: 18px;
    font-weight: bold;
  }
  span {
    float: right;
  }
`;

const DealProducts = styled.div`
  overflow: hidden;
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    > li {
      float: left;
      border-radius: 10px;
      padding: 5px 8px;
      margin: 5px 5px 0 0;
      color: #fff;
      background: #130ef5;
      text-transform: uppercase;
      font-size: 9px;
    }
    .remained-count {
      background: #a3a7ac;
    }
  }
`;

const DealAmount = styled.div`
  float: left;
  margin-top: 10px;
  p {
    margin-bottom: 0;
  }
`;

const DealFormAmount = styled.div`
  margin-top: 10px;
  p {
    margin-bottom: 0;
    font-weight: bold;
  }
`;

const DealFormContainer = styled.div`
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

const DealUsers = styled.ul`
  float: right;
  margin-top: 15px;
  list-style: none;
  li {
    float: left;
    border: 1px solid ${colors.colorWhite};
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 15px;
    background: #a3a7ac;
    text-align: center;
    color: ${colors.colorWhite};
    img {
      vertical-align: top;
    }
  }
`;

const ProductFormContainer = styled.div`
  background: ${colors.colorWhite};
  margin: -40px -40px -30px -40px;
`;

const ProductTable = styled.table`
  width: 100%;
  thead {
    td {
      padding: 10px 10px 10px 0;
      font-weight: bold;
      font-size: 14px;
    }
  }
  tbody {
    td {
      padding: 30px 10px 30px 0;
      vertical-align: top;
      ${DealButton} {
        border: 1px solid ${colors.colorShadowGray};
      }
    }
  }
  td {
    border-bottom: 1px solid ${colors.colorShadowGray};
    &:first-child {
      padding-left: 30px;
    }
    &:last-child {
      padding-right: 30px;
    }
    .remove {
      cursor: pointer;
      i {
        font-size: 17px;
      }
    }
  }
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
    top: ${props => (props.top === 0 ? 'auto' : `${props.top}px`)};
    bottom: ${props => (props.bottom === 0 ? 'auto' : `${props.bottom}px`)};
    left: ${props => `${props.left - 70}px`};
    ${DealFormContainer} {
      float: left;
      width: ${StageWidth - 30}px;
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
  StageBody,
  StageDropZone,
  EmptyStage,
  AddNewDeal,
  DealContainer,
  DealContainerHover,
  DealHeader,
  DealAmount,
  DealFormAmount,
  DealProducts,
  DealFormContainer,
  DealButton,
  DealUsers,
  ProductFormContainer,
  ProductTable,
  ProductFooter,
  FooterInfo,
  AddProduct,
  ProductItemText,
  QuickEditContainer,
  RightControls,
  DealMoveFormContainer
};
