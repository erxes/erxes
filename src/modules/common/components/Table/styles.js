import styled, { css } from 'styled-components';
import { colors, dimensions, typography } from '../../styles';

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
      border: 1px solid ${colors.borderPrimary};
      color: ${colors.textSecondary};
      padding: ${dimensions.unitSpacing}px;
      display: table-cell;
      background-color: ${colors.colorWhite};
    }

    ${props.hover
      ? `tr:hover td{
          background-color: ${colors.borderPrimary};
        }`
      : null} ${props.striped
        ? `tr:nth-of-type(odd) td{
          background-color: ${colors.borderPrimary};
        }`
        : null};
  `};
`;

// tbody, thead tr {
//   display: table;
//   min-width: 100%;
//   table-layout: fixed;
// }

// thead {
//   display:block;
//   width: auto;
//   position: sticky;
//   top:0px;
//   background-color: ${colors.colorWhite};
// }

export default StyledTable;
