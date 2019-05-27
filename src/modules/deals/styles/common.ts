import { ContentBox, Contents, MainContent } from 'modules/layout/styles';
import styled from 'styled-components';

const coreHeight = 50;
const stageWidth = 280;
const borderRadius = '2px';
const stageHeight = 'calc(100vh - 200px)';

const BoardContainer = styled(Contents)`
  margin: 0;

  > div {
    padding-left: 20px;
  }
`;

const PipelineContent = styled(ContentBox)`
  padding: 9px 5px 6px 8px;
  background: ${props => props.color || '#6569df'};
  width: 100%;
  height: 100%;
  margin: -1px;
`;

const BoardContent = styled(MainContent)`
  margin: 0;
`;

const ScrolledContent = styled(ContentBox)``;

export {
  BoardContainer,
  BoardContent,
  coreHeight,
  ScrolledContent,
  stageWidth,
  stageHeight,
  borderRadius,
  PipelineContent
};
