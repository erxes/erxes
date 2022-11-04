import { DateContainer } from '@erxes/ui/src/styles/main';
import { SectionContainer, SidebarCollapse } from '@erxes/ui/src/layout/styles';
import { dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const FlexRow = styled(DateContainer)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px ${dimensions.unitSpacing}px;
`;

const FlexItem = styled.div`
  flex: 1;
  margin-left: 5px;
`;

export { FlexRow, FlexItem, SectionContainer, SidebarCollapse };
