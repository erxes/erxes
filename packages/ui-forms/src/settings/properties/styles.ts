import { colors, dimensions } from '@erxes/ui/src/styles';

import { SortItem } from '@erxes/ui/src/styles/sort';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;

const PropertyList = styled.ul`
  list-style: none;
  padding: 0 ${dimensions.coreSpacing}px;
  margin: 0;
  margin-top: -1px;

  .faAjSp > ${SortItem} {
    border: 0;
    margin: 0;
    padding: 0;
  }

  li {
    position: relative;
    width: 100%;

    &:hover {
      cursor: pointer;
    }
  }
`;

const InputDescription = styled.p`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  margin: 0;
`;

const FieldType = styled.span`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  display: flex;
`;

const CollapseRow = styledTS<{ $isChild: boolean }>(styled.div)`
  font-size: ${coreSpace};
  position: relative;
  display: flex;
  overflow: hidden;
  justify-content: space-between;
  padding: ${props =>
    props.$isChild ? dimensions.unitSpacing : dimensions.coreSpacing}px;
  margin: 0px;
  background: ${colors.colorWhite};

  span {
    font-size: 12px;
    color: ${colors.colorCoreGray};
    margin-left: 5px;
  }
`;

const DropIcon = styledTS<{ $isOpen: boolean }>(styled.i)`
  font-style: normal;
  line-height: 1;

  &:after {
    content: '\\e9a6';
    font-family: 'erxes';
    display: inline-block;
    color: ${colors.colorPrimaryDark};
    font-size: 18px;
    margin-right: ${coreSpace};
    transition: all ease 0.3s;
    transform: ${props => props.$isOpen && `rotate(180deg)`};
  }
`;

const SidebarContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const SidebarFooter = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom: none;
  height: ${dimensions.headerSpacing}px;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.coreSpacing}px;
`;

const SelectInput = styled.div`
  margin-bottom: 5px;

  > div {
    flex: 0;
  }

  label {
    margin-right: 5px;
  }
`;

const LogicIndicator = styled.span`
  background: ${colors.colorCoreOrange};
  padding: 2px 8px;
  font-weight: 500;
  border-radius: 16px;
  text-transform: uppercase;
  font-size: 10px;
  margin-left: 4px;
  color: #fff;
`;

const PropertyListTable = styled.div`
  ${SortItem} {
    margin: 0;
    padding: 0;
  }
`;

const PropertyTableHeader = styled.div`
  display: flex;
  background: ${colors.colorWhite};

  > label {
    padding: 8px 0;
    position: sticky;
    z-index: 1;
    top: 0;
    width: 33%;
    font-weight: bold;

    &:last-child {
      width: 10%;
      padding: 8px 20px 8px 0;
      text-align: right;
    }
  }
`;

const RowField = styled.div`
  width: 33%;
  border-top: 1px solid ${colors.borderPrimary};
  padding: 8px ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:last-child {
    width: 10%;
    padding: 8px 20px 8px 0;
    text-align: right;
  }
`;

const PropertyTableRow = styled.div`
  display: flex;
  flex: 1;

  &:hover {
    ${RowField} {
      background-color: rgb(245, 245, 245);
    }
  }
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .flex-item {
    flex: 1;
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin: 0;
    }

    input[type='checkbox'] {
      display: inline-block;
      height: auto;
      width: auto;
      margin-right: 5px;
    }
  }

  button {
    margin-left: ${dimensions.coreSpacing / 2}px;
  }

  & + div {
    margin-top: ${dimensions.coreSpacing / 2}px;
  }
`;

const ObjectListItemContainer = styled.div`
  border-bottom: 2px dashed ${colors.borderDarker};
  padding-top: 10px;
  padding-bottom: 10px;
`;

const Divider = styled.hr`
  border-top: 4px solid ${colors.borderDarker};
`;

const Footer = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dotted ${colors.borderPrimary};
  font-size: 11px;
  ul {
    float: left;
  }
  > i {
    padding: 3px;
  }
`;

const Row = styled.div`
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

export {
  PropertyList,
  DropIcon,
  FieldType,
  InputDescription,
  CollapseRow,
  SidebarContent,
  SelectInput,
  PropertyListTable,
  LogicIndicator,
  PropertyTableHeader,
  PropertyTableRow,
  RowField,
  FlexRow,
  ObjectListItemContainer,
  Divider,
  SidebarFooter,
  Footer,
  Row
};
