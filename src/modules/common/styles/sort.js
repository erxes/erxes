import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const SortItem = styled.li`
  background: ${colors.colorWhite};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  display: block;
  padding: 10px 20px 10px 40px;
  margin-bottom: 5px;
  z-index: 2000;
  list-style: none;
  position: relative;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 8px ${colors.shadowPrimary};

  &:last-child {
    margin: 0;
  }
`;

const SortableWrapper = styled.ul`
  padding: 0px;
  margin: 0;
  list-style-type: none;
  max-height: 420px;
  overflow: auto;

  ${SortItem} {
    box-shadow: none;
  }

  label {
    margin: 0;
  }
`;

const DragHandler = styled.div`
  cursor: row-resize;
  position: absolute;
  display: flex;
  left: 10px;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 20px;
  align-items: center;
  justify-content: center;

  i {
    font-size: 16px;
    color: ${colors.colorLightGray};
  }
`;

export { SortItem, SortableWrapper, DragHandler };
