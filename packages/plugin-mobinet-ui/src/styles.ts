import dimensions from '@erxes/ui/src/styles/dimensions';
import styled from 'styled-components';

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
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

export const ToggleWrap = styled.div`
  width: 180px !important;

  > div > div {
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

export { LeftContent, Row };
