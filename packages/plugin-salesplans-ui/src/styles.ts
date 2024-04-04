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

export { FilterContainer, LabelsTableWrapper, SidebarFilters };
