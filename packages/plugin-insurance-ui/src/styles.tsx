import dimensions from '@erxes/ui/src/styles/dimensions';
import styled from 'styled-components';

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;

  button {
    margin-left: ${dimensions.unitSpacing}px;
    padding: 3px 6px;
  }
`;

export { PriceRow };
