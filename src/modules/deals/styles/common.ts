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

const BoardContent = styled(MainContent)`
  margin: 0;
  background: #6569df;
`;

const ScrolledContent = styled(ContentBox)`
  padding: 4px 0 8px;
  margin: 6px 10px 4px 5px;
`;

export {
  BoardContainer,
  BoardContent,
  coreHeight,
  ScrolledContent,
  stageWidth,
  stageHeight,
  borderRadius
};
