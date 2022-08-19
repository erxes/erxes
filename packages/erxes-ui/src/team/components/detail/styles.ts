import { colors, dimensions } from '@erxes/ui/src/styles';

import { SidebarList } from '@erxes/ui/src/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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

const MailBox = styled.div`
  background: ${colors.colorWhite};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  transition: all ease 0.3s;
`;

const NameContainer = styled.div`
  flex: 1;
  word-break: break-word;

  p {
    color: ${colors.colorCoreLightGray};
    margin: 0;
    font-size: 12px;
  }
`;

const Name = styledTS<{ fontSize?: number }>(styled.div)`
  font-size: ${props => props.fontSize && `${props.fontSize}px`};
  font-weight: 500;

  i {
    margin-left: 10px;
    transition: all 0.3s ease;
    color: ${colors.colorCoreLightGray};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreGray};
    }
  }
`;

const UserHeader = styled.div`
  margin: 0 -10px;
  padding: 10px 0;
`;

export { List, SkillList, MailBox, NameContainer, Name, UserHeader };
