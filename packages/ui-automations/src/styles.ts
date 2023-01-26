import styled from 'styled-components';
import { dimensions, colors } from '@erxes/ui/src/styles';
import { HeaderContent } from '@erxes/ui-cards/src/boards/styles/item';

export const ScrolledContent = styled.div`
  flex: 1;
  overflow: auto;
`;

export const BoardHeader = styled(HeaderContent)`
  .header-row {
    display: flex;
    justify-content: space-between;

    > div > span {
      color: ${colors.colorSecondary};
      font-weight: 500;
      cursor: pointer;
      margin-left: ${dimensions.unitSpacing}px;
    }
  }
`;

export const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;
