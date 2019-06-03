import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

// Item list
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
