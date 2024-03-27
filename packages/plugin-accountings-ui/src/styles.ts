import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Table from '@erxes/ui/src/components/table';

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
  word-break: break-all;
`;

const ProductContent = styled.div`
  padding: 12px 22px;
  word-break: break-word;
  background: rgba(10, 30, 65, 0.05);
  margin-top: 10px;
  transition: background 0.3s ease;
  border-radius: 3px;
  min-height: 50px;
  p {
    color: ${colors.textPrimary};
    font-size: 13px;
  }
  img,
  table,
  * {
    max-width: 576px !important;
  }
  ul,
  ol {
    padding-left: 20px;
    margin: 0 0 10px;
  }
  &:hover {
    background: rgba(10, 30, 65, 0.08);
    cursor: pointer;
  }
`;

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  margin: 0 auto;
`;

const ProductBarcodeContent = styledTS<{ isValid?: boolean }>(styled.div)`
  a {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    
    color: ${(props) =>
      props.isValid ? colors.colorCoreGreen : colors.colorCoreGray} !important;
  }

  a:hover {
    color: ${(props) =>
      props.isValid ? colors.colorCoreGreen : lighten(colors.textPrimary, 40)};
  }
`;

const BarcodeContentWrapper = styled.div`
  width: 0px;
  height: 0px;
  position: absolute;
  display: none;
  pointer-events: none;
`;

const SidebarContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

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

export {
  InfoDetail,
  ProductContent,
  ContentBox,
  ProductBarcodeContent,
  BarcodeContentWrapper,
  SidebarContent,
};
