import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const PipelineContainer = styled.div`
  background-color: ${colors.colorWhite};
  min-height: 100%;
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
  display: flex;
  height: calc(100% - 85px);
`;

const StageContainer = styled.div`
  flex: 1;
  height: 100%;
  border-right: 1px solid ${colors.colorShadowGray};
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
`;

const DealButton = styled.div`
  padding: 7px 10px;
  margin-bottom: 10px;
  background: ${colors.colorWhite};
  border-radius: 5px;
  i {
    float: right;
  }
`;

const ProductFormContainer = styled.div`
  background: ${colors.colorWhite};
`;

const ProductItemList = styled.table`
  vertical-align: top;
  margin: -40px -40px 0 -40px;
  thead>tr {
    padding: 10px 30px;
    td {
      padding-right: 10px 
      font-weight: bold;
      font-size: 14px;
    }
  }
  tbody>tr {
    padding: 30px 30px 20px 30px;
    td {
      padding-bottom: 10px;
    }
  }
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
  ProductItemList
};
