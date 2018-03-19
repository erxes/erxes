import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { SidebarList } from 'modules/layout/styles';
import { NameWrapper } from 'modules/customers/components/detail/sidebar/styles';

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

const User = NameWrapper.extend`
  padding: ${dimensions.coreSpacing}px 0;
  justify-content: space-between;
`;

const Links = styled.div`
  a {
    color: ${colors.colorCoreLightGray};
    margin-right: 10px;

    &:hover {
      color: ${colors.colorCoreGray};
    }

    i {
      font-size: 14px;
    }
  }
`;

export { List, User, Links };
