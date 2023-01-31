import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import { Table } from '@erxes/ui/src';
import styledTS from 'styled-components-ts';
import { SideContent } from '@erxes/ui/src/layout/styles';

export const FinanceAmount = styled.div`
  float: right;
`;

export const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
  word-break: break-all;
`;

export const OverallWorkSidebar = styled.div`
  padding: 12px 20px;
  border-color: black;
  border: 3px;
  border-radius: 3px;
  cursor: default;
`;

export const ProductContent = styled.div`
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

export const FlexRow = styled.div`
  flex: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const DetailRow = styled(FlexRow)`
  justify-content: space-around;
`;

export const TableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
export const FilterBox = styled.div`
  text-align: left;
  .Select {
    margin-bottom: 15px;
  }

  input {
    margin-bottom: 20px;
  }

  .input-container {
    width: 50%;
  }
`;

export const CustomRangeContainer = styled.div`
  display: flex;

  > div {
    flex: 1;

    &:last-child {
      margin-left: 5px;
    }
  }

  input {
    max-width: 175px;
  }

  .filterDate {
    max-width: 50%;
  }
`;

export const FilterButton = styledTS<{ selected?: boolean }>(styled.div)`
  padding: 5px 20px;
  background: ${props =>
    props.selected ? colors.colorSecondary : colors.bgActive};
  color: ${props =>
    props.selected ? colors.colorWhite : colors.textSecondary};
  line-height: 20px;
  width: 100%;
  margin-bottom: 10px;
  position: relative;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.selected ? colors.colorPrimaryDark : colors.bgGray};
    cursor: pointer;
  }
`;

export const RightMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  top: 100px;
  right: 0;
  bottom: 0;
  width: 400px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
`;

export const TabContent = styled.div`
  padding: 15px 20px 0px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`;

export const MenuFooter = styled.footer`
  display: flex;
  padding: 10px 20px;
  max-width: 95%;
`;

export const SidebarFilters = styledTS(styled.div)`
  overflow: hidden;
  padding: 5px 15px 30px 15px;
  height: 100%;
`;

export const CustomSideContent = styledTS<{
  wide?: boolean;
  half?: boolean;
  full?: boolean;
  hasBorder?: boolean;
}>(styled(SideContent))`
  width: ${props => (props.wide ? '550px' : '290px')};
`;

export const AddTrigger = styled.div`
  display: block;
  margin: ${dimensions.coreSpacing}px;
  text-align: center;

  button {
    font-size: 11px;
    padding-bottom: 7px;
  }
`;
