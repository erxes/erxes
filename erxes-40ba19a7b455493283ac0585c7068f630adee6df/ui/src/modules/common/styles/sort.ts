import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const SortItem = styledTS<{ isDragging: boolean; isModal: boolean }>(
  styled.div
)`
  background: ${colors.colorWhite};
  display: block;
  padding: 5px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  justify-content: space-between;
  border-left: 2px solid transparent; 
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
  }
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
