import { colors, dimensions, typography } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const tableHoverColor = '#f5f5f5';

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
      color: ${colors.textPrimary};
      padding: ${dimensions.unitSpacing - 2}px;
      display: table-cell;
      vertical-align: ${props.alignTop && 'top'};
    }

    thead {
      th,
      td {
        text-transform: uppercase;
        color: ${colors.colorCoreGray};
        font-size: ${typography.fontSizeUppercase}px;
      }

      th {
        background-color: ${colors.bgLight};
        position: sticky;
        z-index: 1;
        top: 0;
      }
    }

    ${props.bordered
      ? `th, td { border-bottom: 1px solid ${colors.borderPrimary}; }`
      : null} ${props.striped
      ? `tr:nth-of-type(odd) td { background-color: ${colors.bgLightPurple}; }`
      : null} th {
      border-top: none;
    }

    tr:hover td {
      background-color: ${tableHoverColor};
    }

    th:first-child,
    td:first-child {
      width: 50px;
      text-align: center;
      border-left: none;
    }

    th:last-child,
    td:last-child {
      border-right: none;
    }
  `};
`;

export { ImportColumnRow, ColumnTable, FlexRow };
