import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SortItem } from 'modules/common/styles/sort';

const coreSpace = `${dimensions.coreSpacing}px`;

const PropertyList = styled.ul`
  list-style: none;
  padding: 0;
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

const CollapseRow = styled.div`
  font-size: ${coreSpace};
  position: relative;
  display: flex;
  overflow: hidden;
  justify-content: space-between;
  padding: ${dimensions.coreSpacing}px;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.borderPrimary};
  border-top: 1px solid ${colors.borderPrimary};

  span {
    font-size: 12px;
    color: ${colors.colorCoreGray};
    margin-left: 5px;
  }
`;

const DropIcon = styledTS<{ isOpen: boolean }>(styled.i)`
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
    transform: ${props => props.isOpen && `rotate(180deg)`};
  }
`;

const SidebarContent = styled.div`
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
    ${dimensions.unitSpacing}px;
`;

const SelectInput = styled.div`
  margin-bottom: 5px;

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
  background: ${colors.bgLight};

  > label {
    padding: 8px ${dimensions.coreSpacing}px;
    position: sticky;
    z-index: 1;
    top: 0;
    width: 33%;

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
  flex 1;

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

const ObjectList = styled.div`
  ul {
    padding: 0;
    border-bottom: 1px dashed ${colors.borderDarker};

    li {
      padding: 5px 0;
      display: flex;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      > div {
        text-transform: capitalize;
      }
    }

    &:last-child {
      border: 0;
    }
  }
`;

const Pin = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -20px 0 0 -20px;
  animation-name: bounce;
  animation-fill-mode: both;
  animation-duration: 1s;
  &::after {
    content: '';
    width: 14px;
    height: 14px;
    margin: 8px 0 0 8px;
    background: #ffffff;
    position: absolute;
    border-radius: 50%;
  }

  @keyframes bounce {
    0% {
      opacity: 0;
      transform: translateY(-2000px) rotate(-45deg);
    }
    60% {
      opacity: 1;
      transform: translateY(30px) rotate(-45deg);
    }
    80% {
      transform: translateY(-10px) rotate(-45deg);
    }
    100% {
      transform: translateY(0) rotate(-45deg);
    }
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 250px;
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
  ObjectList,
  Pin,
  MapContainer
};
