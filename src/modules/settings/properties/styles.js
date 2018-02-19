import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const PropertyList = styled.ul`
  list-style: none;

  li {
    padding: ${coreSpace} 0;

    &:hover {
      cursor: pointer;
    }
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  right: ${coreSpace};

  i {
    margin-left: ${coreSpace};
  }
`;

export { ContentBox, PropertyList, ActionButtons };
