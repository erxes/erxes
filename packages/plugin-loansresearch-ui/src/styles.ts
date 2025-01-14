import { colors, dimensions, SidebarList } from '@erxes/ui/src';
import styled from 'styled-components';

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 96%;
  margin: 0 auto;
`;

export const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    i {
      margin-left: ${dimensions.unitSpacing / 2}px;
    }

    &:last-child {
      border: none;
    }
  }
`;
