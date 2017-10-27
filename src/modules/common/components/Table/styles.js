import styled, { css } from 'styled-components';
import { colors, dimensions, typography } from '../../styles';
import { Input, FormLabel } from '../Form/styles';

const tableBgColor = '#f9f9f9';
const tableHoverColor = '#f5f5f5';

const StyledTable = styled.table`
  ${props => css`
    width: 100%;
    max-width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    font-weight: ${typography.fontWeightRegular};
    white-space: ${props.whiteSpace || ''};

    th,
    td {
      border-top: 1px solid ${colors.borderPrimary};
      color: ${colors.textSecondary};
      padding: ${dimensions.unitSpacing}px;
      display: table-cell;
      background-color: ${colors.colorWhite};
      font-weight: ${typography.fontWeightLight};

      & ${FormLabel}, & ${Input} {
        margin: 0px;
      }
    }

    thead {
      th,
      td {
        text-transform: uppercase;
        font-weight: ${typography.fontWeightRegular};
        color: ${colors.colorCoreLightGray};
        font-size: ${typography.fontSizeUppercase}px;
      }
    }

    ${props.hover
      ? `tr:hover td { background-color: ${tableHoverColor}; }`
      : null} ${props.bordered
        ? `th, td { border: 1px solid ${colors.borderPrimary}; }`
        : null} ${props.striped
        ? `tr:nth-of-type(odd) td { background-color: ${tableBgColor}; }`
        : null} th {
      border-top: none;
    }

    th:first-child,
    td:first-child {
      border-left: none;
    }

    th:last-child,
    td:last-child {
      border-right: none;
    }

    td.table-field-name .button-icon {
      margin-left: 12px;
      opacity: 0;
      transition: all 0.3s ease;

      i {
        margin: 0px;
      }
    }

    td.table-field-name:hover .button-icon {
      opacity: 1;
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
