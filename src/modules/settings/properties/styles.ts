import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;

const PropertyList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    position: relative;

    &:hover {
      cursor: pointer;
    }
  }
`;

const Row = styled.div`
  display: flex;
  height: 100%;

  > button {
    flex-shrink: 0;
    margin-left: 10px;
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

  &:after {
    content: '\\e827';
    font-family: 'erxes';
    display: inline-block;
    color: ${colors.colorPrimaryDark};
    font-size: 16px;
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

export {
  PropertyList,
  DropIcon,
  FieldType,
  InputDescription,
  Row,
  CollapseRow,
  SidebarContent,
  SelectInput
};
