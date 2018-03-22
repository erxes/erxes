import { colors, dimensions } from 'modules/common/styles';
import { SidebarList } from 'modules/layout/styles';

const List = SidebarList.extend`
  li {
    border-top: 1px solid ${colors.borderPrimary};

    > a {
      padding: ${dimensions.unitSpacing}px 20px;
      color: ${colors.textPrimary};
      white-space: normal;

      p {
        color: ${colors.colorCoreLightGray};
        margin: 0;
      }
    }
  }
`;

export { List };
