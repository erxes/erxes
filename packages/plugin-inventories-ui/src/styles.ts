import { dimensions, colors, ContentHeader } from '@erxes/ui/src';
import StyledTable from '@erxes/ui/src/components/table/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

export const LinkButton = styled.a`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  float: right;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export const FinanceAmount = styled.div`
  float: right;
`;

export const Actions = styled.div`
  float: right;
`;

export const Content = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;

  > form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

export const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;

  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;

    &:hover {
      background: none;
    }

    &:focus {
      color: inherit;
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

export const FlexColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

export const FlexItem = styled.div`
  display: flex;
  height: 100%;
`;

export const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

export const PaddingTop = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
`;

export const TableOver = styled(StyledTable)`
  thead {
    th,
    td {
      border-bottom: 1px dotted black;
    }
  }

  thead {
    tr:first-child {
      th {
        text-align: center;
      }

      th:nth-of-type(2) {
        border-right: 1px solid black;
      }
    }
    tr:last-child {
      th:nth-of-type(2) {
        border-right: 1px solid black;
      }
    }
  }

  tr {
    td:nth-of-type(3) {
      border-right: 1px solid black;
    }
  }
`;
