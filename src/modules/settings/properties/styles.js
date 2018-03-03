import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const PropertyList = styled.ul`
  list-style: none;
  padding: 0 ${coreSpace};

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
    float: right;
  }

  li {
    margin-bottom: 10px;
    background-color: ${colors.colorLightBlue};
    border: 1px solid ${colors.borderPrimary};
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;

    &:hover {
      cursor: pointer;
    }
  }
`;

const AddOption = styled.div`
  color: ${colors.colorSecondary};
  font-weight: 500;
  padding: 5px 0;

  &:hover {
    cursor: pointer;
  }
`;

const FieldType = styled.span`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  display: flex;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DropIcon = styled.span`
  &:after {
    content: '\f125';
    font-family: 'Ionicons';
    float: left;
    color: ${colors.colorPrimaryDark};
    font-size: ${dimensions.coreSpacing - 2}px;
    margin-right: ${coreSpace};
    transition: all ease 0.3s;
    transform: ${props => props.isOpen && `rotate(90deg)`};
  }
`;

const InputDescription = styled.span`
  display: block;
  font-size: 12px;
  color: ${colors.colorCoreGray};
`;

export {
  ContentBox,
  PropertyList,
  DropIcon,
  TypeList,
  AddOption,
  Actions,
  FieldType,
  InputDescription
};
