import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const PipelineContainer = styled.div`
  background-color: ${colors.colorWhite};
  overflow: auto;
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
  height: calc(100% - 85px);
`;

const StageContainer = styled.div`
  float: left;
  width: 700px;
  height: 100%;
  border-right: 1px solid ${colors.colorShadowGray};
  h3 {
    margin: 30px 0;
    border-bottom: 1px solid ${colors.colorShadowGray};
    font-size: 18px;
    text-transform: uppercase;
  }
`;

const DealContainer = styled.div`
  margin: 10px 0;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid ${colors.colorShadowGray};
  background-color: #f6f6f6;
`;

export {
  PipelineContainer,
  PipelineHeader,
  PipelineBody,
  DealContainer,
  StageContainer
};
