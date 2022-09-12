import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import { Table } from '@erxes/ui/src';

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
  word-break: break-all;
`;

const OverallWorkSidebar = styled.div`
  padding: 12px 20px;
  border-color: black;
  border: 3px;
  border-radius: 3px;
  cursor: default;
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

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

export const TableOver = styled(Table)`
  box-shadow: 1px solid black;
  border-collapse: collapse;

  tbody {
    td {
      padding: 4px 8px 4px 0;
      border-top-width: 0px;
      border-bottom: none;
    }
  }
`;

export { InfoDetail, ProductContent, OverallWorkSidebar };
