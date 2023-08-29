import Table from '@erxes/ui/src/components/table';
import { colors } from '@erxes/ui/src/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';

export const CategoryContainer = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

export const BarcodeItem = styled.div`
  padding: 2px 2px;
  &:hover {
    cursor: pointer;
    color: ${lighten(colors.textPrimary, 40)};
    background: ${colors.bgActive};
    text-decoration: line-through;
  }
`;

export const TableBarcode = styled(Table)`
  margin-top: 10px;
  box-shadow: 1px solid black;
  border-collapse: collapse;

  thead {
    th {
      border: 1px solid ${colors.borderPrimary};
      border-top: none;
      text-align: center;
    }
  }

  tbody {
    td {
      border-bottom: none;
      text-align: center;
    }

    tr td {
      padding-top: 0px;
      padding-bottom: 1px;
    }
  }
`;

export const TableOver = styled.table`
  box-shadow: 1px solid black;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid black;
    width: 25px;
    text-align: center;

    td:last-child {
      width: 90px;
      border-right: none;
      text-align: right;
    }

    input {
      width: 30px;
      text-align: center;
      outline: 0;
      border: 1px solid ${colors.borderDarker};
      border-radius: 2px;
      font-size: 12px;
      height: 24px;
      margin-left: 5px;
    }
    button {
      margin-left: 5px;
      margin-right: 5px;
    }
  }
  td.active {
    color: red;
  }
`;
