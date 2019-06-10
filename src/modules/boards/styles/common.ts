import { colors } from 'modules/common/styles';
import { ContentBox, Contents, MainContent } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const coreHeight = 50;
export const stageWidth = 280;
export const borderRadius = '2px';
export const stageHeight = 'calc(100vh - 200px)';

export const BoardContainer = styled(Contents)`
  margin: 0;

  > div {
    padding-left: 20px;
  }
`;

export const BoardContent = styled(MainContent)`
  margin: 0;
  background: #6569df;
`;

export const ScrolledContent = styled(ContentBox)`
  padding: 4px 0 8px;
  margin: 6px 10px 4px 5px;
`;

// IItem list
export const DropZone = styled.div`
  min-height: 160px;
`;

export const EmptyContainer = styled.div`
  height: 160px;
`;

export const Wrapper = styledTS<{ isDraggingOver: boolean }>(styled.div)`
  background-color: ${({ isDraggingOver }) =>
    isDraggingOver && 'rgba(10, 45, 65, .1)'};
  display: flex;
  flex-direction: column;
  padding: 0 4px;
  transition: background-color 0.1s ease, opacity 0.1s ease;
  user-select: none;
`;

export const SelectContainer = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  width: 300px;
  padding: 20px;
  z-index: 100;
  box-shadow: 0 0 8px 1px rgba(221, 221, 221, 0.7);
  background: ${colors.colorWhite};
`;

export const Date = styled.span`
  font-size: 11px;
  color: rgb(136, 136, 136);
  z-index: 10;
`;

export const ItemContainer = styledTS<{ isDragging?: boolean }>(styled.div)`
  margin-bottom: 8px;
  background-color: rgb(255, 255, 255);
  box-shadow: ${props =>
    props.isDragging
      ? 'rgba(0, 0, 0, 0.4) 0px 5px 15px 0px'
      : 'rgba(0, 0, 0, 0.2) 0px 1px 2px 0px'};
  overflow: hidden;
  padding: 8px;
  outline: 0px;
  font-size: 12px;
  border-radius: ${borderRadius};
  transition: box-shadow 0.3s ease-in-out 0s;
  -webkit-box-pack: justify;
  justify-content: space-between;
  will-change: transform;
`;
