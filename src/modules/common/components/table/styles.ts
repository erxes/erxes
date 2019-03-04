import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions, typography } from '../../styles';
import { FormLabel, Input } from '../form/styles';

const tableHoverColor = '#f5f5f5';

const StyledTable = styledTS<{
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

    th {
      .table-sorter {
        float: left;
        padding-right: 10px;
        color: ${colors.colorSecondary};

        i {
          display: block;
          line-height: 8px;

          &:hover {
            cursor: pointer;
          }
        }
      }
    }

    th,
    td {
      border-top: 1px solid ${colors.borderPrimary};
      color: ${colors.textPrimary};
      padding: ${dimensions.unitSpacing}px;
      display: table-cell;
      vertical-align: ${props.alignTop && 'top'};

      & ${FormLabel}, & ${Input} {
        margin: 0px;
      }
    }

    thead {
      th,
      td {
        text-transform: uppercase;
        color: ${colors.colorCoreLightGray};
        font-size: ${typography.fontSizeUppercase}px;
      }
      th {
        background-color: ${colors.colorWhite};
        position: sticky;
        z-index: 1;
        top: 0;
      }
    }

    ${
      props.hover
        ? `tr:hover td { background-color: ${tableHoverColor}; cursor: pointer; }`
        : null
    } ${
    props.bordered
      ? `th, td { border: 1px solid ${colors.borderPrimary}; }`
      : null
  } ${
    props.striped
      ? `tr:nth-of-type(odd) td { background-color: ${colors.bgUnread}; }`
      : null
  } th {
      border-top: none;
    }

    th:first-child,
    td:first-child {
      border-left: none;
    }

    th:last-child,
    td:last-child {
      border-right: none;
      text-align: right;
    }

    @media (min-width: 1170px) {
      th,
      td {
        padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
      }
    }
  `};
`;

export default StyledTable;
