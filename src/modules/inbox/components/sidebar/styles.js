import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';

const RightItems = styled.div`
  > div {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const LeftItem = styled.div`
  label {
    margin: 0;
  }
`;

export { RightItems, LeftItem };
