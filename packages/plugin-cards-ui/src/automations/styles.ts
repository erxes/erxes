import styled from 'styled-components';
import { dimensions, colors } from '@erxes/ui/src/styles';

// ! will refactor again
export const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

export const BoardItemWrapper = styled(DrawerDetail)`
  > div > div {
    padding: 0;
  }
`;
