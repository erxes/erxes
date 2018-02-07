import styled from 'styled-components';

const PipelineContainer = styled.div`
  flex: 1;
  background-color: #fff;
  overflow: auto;
  min-height: 100%;
  margin-bottom: 20px;
`;

const PipelineHeader = styled.div`
  padding: 20px;

  h2 {
    margin: 0;
    padding: 0;
    font-size: 14px;
  }
`;

const Item = styled.li`
  float: left;
  width: 300px;
  margin-right: 30px;
`;

export { PipelineContainer, PipelineHeader, Item };
