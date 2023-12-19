import styled from 'styled-components';
import styledTS from 'styled-components-ts';
// erxes
import { colors, dimensions } from '@erxes/ui/src/styles';

export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select,
  input {
    max-width: 400px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

export const Table = styled.table`
  width: 100%;

  tr {
    margin: 0 20px;
  }

  th:first-child,
  td:first-child {
    width: 300px;
  }

  th,
  td {
    color: ${colors.textPrimary};
    padding: ${dimensions.unitSpacing - 2}px;
    display: table-cell;

    &:first-child {
      padding-left: 0;
    }
  }

  th:last-child,
  td:last-child {
    border-right: none;
    text-align: right;
  }
`;

export const SidebarFilters = styledTS(styled.div)`
  padding: 5px 15px 30px 15px;
`;
