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

const TypeList = PropertyList.extend`
  button {
    margin-top: 10px;
  }

  li {
    margin-bottom: 5px;
    background-color: ${colors.colorWhite};
    border: 1px solid ${colors.borderPrimary};
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;

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

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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

export {
  PropertyList,
  DropIcon,
  TypeList,
  Actions,
  FieldType,
  InputDescription,
  CollapseRow,
  SidebarContent
};
