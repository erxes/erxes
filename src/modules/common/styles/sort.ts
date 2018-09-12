import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const SortItem = styledTS<{ isDragging: boolean, isModal: boolean }>(styled.div)`
  background: ${colors.colorWhite};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  display: block;
  padding: 10px 15px;
  margin-bottom: 5px;
  z-index: 2000;
  position: relative;
  display: flex;
  justify-content: space-between;
  box-shadow: ${props =>
    props.isDragging ? `0 2px 8px ${colors.shadowPrimary}` : 'none'};
  left: ${props =>
    props.isDragging && props.isModal ? '40px!important' : 'auto'};
  &:last-child {
    margin: 0;
  }
`;

const SortableWrapper = styled.div`
  width: 100%;
  max-height: 420px;
  overflow: auto;

  label {
    margin: 0;
  }
`;

const DragHandler = styled.div`
  display: flex;
  width: 20px;
  margin-right: 10px;
  align-items: center;
  justify-content: center;

  i {
    color: ${colors.colorLightGray};
  }
`;

export { SortItem, SortableWrapper, DragHandler };
