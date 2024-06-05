import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FilterContainer = styled.div`
  position: relative;
  padding-bottom: ${dimensions.coreSpacing}px;
  z-index: 2;
`;

const LabelsTableWrapper = styled.div`
  border: 1px solid ${colors.borderDarker};
  border-radius: 5px;
  padding: 10px 0px !important;
`;

const SidebarFilters = styledTS(styled.div)`
  overflow: hidden;
  padding: 5px 15px 30px 15px;
  height: 100%;
`;

export const TableWrapper = styled.div`
  th {
    min-width: 60px;
  }

  td {
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const FormTable = styled.table`
  width: 100%;

  td {
    padding-right: ${dimensions.coreSpacing}px;
    width: 19%;
  }

  tr {
    td:last-child {
      padding: 0;
    }
  }
`;

export const LevelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const RemoveRow = styled.a`
  margin-top: ${dimensions.unitSpacing + 2}px;
  margin-left: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing / 2}px;
  color: ${colors.colorCoreDarkGray};

  &:hover {
    cursor: pointer;
    color: ${colors.colorCoreRed};
  }
`;

export const LevelOption = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
`;

export { FilterContainer, LabelsTableWrapper, SidebarFilters };
