import { colors } from '../styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const SortItem = styledTS<{
  isDragging: boolean;
  isModal: boolean;
  column?: number;
}>(styled.div)`
  background: ${colors.colorWhite};
  display: block;
  padding: 5px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  justify-content: space-between;
  border-left: 2px solid transparent; 
  border-top: ${props =>
    !props.isDragging ? `1px solid ${colors.borderPrimary}` : 'none'};
  border-radius: 4px;
  box-shadow: ${props =>
    props.isDragging ? `0 2px 8px ${colors.shadowPrimary}` : 'none'};
  left: ${props =>
    props.isDragging && props.isModal ? '40px!important' : 'auto'};
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: 0 2px 8px ${colors.shadowPrimary};
    border-color: ${colors.colorSecondary};
    border-top: none;
  }
  ${props =>
    props.column &&
    css`
      width: ${100 / props.column}%;
      display: inline-block;
    `}
`;

const SortableWrapper = styled.div`
  width: 100%;
  flex: 1;
  label {
    margin: 0;
  }
`;

const DragHandler = styled.div`
  display: flex;
  width: 20px;
  margin-right: 5px;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  i {
    color: ${colors.colorLightGray};
  }
`;

export { SortItem, SortableWrapper, DragHandler };
