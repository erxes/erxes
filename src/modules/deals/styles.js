import styled from 'styled-components';
import { colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const PipelineContainer = styled.div`
  background-color: ${colors.colorWhite};
  height: 100%;
  margin-bottom: 20px;
`;

const PipelineHeader = styled.div`
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
  display: inline-flex;
  height: calc(100% - 85px);
`;

const StageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 330px;
  border-right: 1px solid ${colors.colorShadowGray};
  background: ${({ isDragging }) =>
    isDragging ? rgba(colors.colorCoreDarkGray, 0.2) : 'none'};
  transition: background-color 0.1s ease;
  h3 {
    margin: 0;
    padding: 30px;
    border-bottom: 1px solid ${colors.colorShadowGray};
    font-size: 18px;
    text-transform: uppercase;
  }
`;

const StageBody = styled.div`
  padding: 10px 30px;
`;

const AddNewDeal = styled.a`
  display: block;
  margin: 10px 30px;
  height: 70px;
  line-height: 70px;
  text-align: center;
  border: 1px dotted ${colors.colorShadowGray};
  border-radius: 5px;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  font-size: 14px;
  i {
    margin-right: 8px;
    font-size: 15px;
  }
`;

const DealContainer = styled.div`
  margin: 10px 0;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid ${colors.colorShadowGray};
  background-color: #f6f6f6;
`;

const DealFormContainer = styled.div`
  margin: 10px 30px;
  padding: 30px;
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
  i {
    float: right;
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
  }
`;

const ProductFooter = styled.div`
  padding: 30px;
`;

const FooterInfo = styled.div`
  overflow: hidden;
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
  cursor: hand;
  i {
    padding-right: 8px;
  }
`;

const ProductItemText = styled.div`
  height: 34px;
  line-height: 34px;
  font-weight: bold;
  text-align: ${props => props.align || 'left'};
`;

export {
  PipelineContainer,
  PipelineHeader,
  PipelineBody,
  StageContainer,
  StageBody,
  AddNewDeal,
  DealContainer,
  DealFormContainer,
  DealButton,
  ProductFormContainer,
  ProductTable,
  ProductFooter,
  FooterInfo,
  AddProduct,
  ProductItemText
};
