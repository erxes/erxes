import { colors, dimensions } from 'erxes-ui';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const ImportColumnRow = styled.tr`
  i {
    font-size: 15px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;

  > button {
    margin: 0 10px;
  }

  .Select {
    flex: 1;
  }
`;

const ColumnTable = styledTS<{
  whiteSpace?: string;
  alignTop?: boolean;
  hover?: boolean;
  bordered?: boolean;
  striped?: boolean;
}>(styled.table)`
  ${props => css`
    width: 100%;
    max-width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    white-space: ${props.whiteSpace || ''};

    th,
    td {
      border-top: 1px solid ${colors.borderPrimary};
      padding: ${dimensions.unitSpacing - 2}px;
      display: table-cell;
      vertical-align: ${props.alignTop && 'top'};
    }

    thead {
      th {
        position: sticky;
        z-index: 1;
        top: 0;
      }
    }

    th {
      font-weight: normal
      border-top: none;
    }

    th:first-child,
    td:first-child {
      border-left: none;
    }
  `};
`;

export { ImportColumnRow, ColumnTable, FlexRow };
