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
    padding: ${coreSpace} 0;

    &:hover {
      cursor: pointer;
    }
  }
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

export { ContentBox, PropertyList, DropIcon };
