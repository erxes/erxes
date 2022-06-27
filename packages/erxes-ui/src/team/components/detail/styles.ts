import { colors, dimensions } from '@erxes/ui/src/styles';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import styled from 'styled-components';

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};

    > a {
      padding: ${dimensions.unitSpacing}px 20px;
      color: ${colors.textPrimary};
      white-space: normal;

      p {
        color: ${colors.colorCoreLightGray};
        margin: 0;
      }
    }

    &:last-child {
      border: none;
    }
  }
`;

const SkillList = styled.div`
  padding: 10px;
  button {
    margin: 4px;
  }
`;

export { List, SkillList };
