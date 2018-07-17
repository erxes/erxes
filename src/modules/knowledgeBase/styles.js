import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: transform 0.3s ease;
  transform: translate(80px);

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export { ActionButtons };
