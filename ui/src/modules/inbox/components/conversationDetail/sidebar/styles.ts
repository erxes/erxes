import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  EmailContent,
  FlexCenterContent,
  Timeline
} from 'modules/activityLogs/styles';
import { colors, dimensions, typography } from 'modules/common/styles';
import { ActivityContent, DateContainer } from 'modules/common/styles/main';
import { SidebarBox, SidebarTitle } from 'modules/layout/styles';
import styled from 'styled-components';
import {
  FormTable,
  MessageBody,
  MessageContent,
  MessageItem,
  UserInfo
} from '../workarea/conversation/styles';
import { Meta } from '../workarea/mail/style';

const iconWrapperWidth = '60px';

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

const SectionContainer = styled.div`
  position: relative;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
  margin-bottom: 10px;

  > div {
    margin-bottom: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  ${SidebarBox} {
    box-shadow: none;
  }

  ${SidebarTitle} {
    height: 40px;
  }
`;

const NoteFormContainer = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};

  > span {
    padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
      ${dimensions.unitSpacing}px;
    display: block;
  }

  .draftJsToolbar__toolbar__dNtBH button {
    width: 25px;
  }
`;

const ActivityLogContent = styled(ActivityContent)`
  padding: 0 ${dimensions.coreSpacing}px;
  margin-bottom: 30px;

  ${Timeline} {
    padding-left: 30px;

    &:before {
      left: 5px;
    }
  }

  ${AvatarWrapper} {
    display: none;
  }

  ${ActivityIcon} {
    left: calc(-${iconWrapperWidth} + ${iconWrapperWidth} * 0.3);
  }

  ${ActivityRow} {
    padding: ${dimensions.unitSpacing * 1.5}px 0;
    box-shadow: none;
  }

  ${ActivityDate} {
    margin: 0;
    font-style: italic;
    font-size: ${typography.fontSizeUppercase}px;
  }

  ${EmailContent}, ${MessageItem} {
    padding: 0;
  }

  ${MessageContent}, ${UserInfo} {
    padding: 5px 10px;
  }

  ${MessageBody} {
    margin: 0;
    flex-direction: column;

    footer {
      margin: 5px 10px 0;
    }
  }

  ${Meta}, ${FlexCenterContent} {
    flex-direction: column;
  }

  ${FormTable} {
    overflow: auto;

    td {
      white-space: nowrap;
    }
  }
`;

const BasicInfo = styled.div`
  margin-top: 10px;
`;

const TabContent = styled.div`
  ul {
    padding: ${dimensions.unitSpacing}px 0;
  }
`;

const SidebarCollapse = styled.a`
  color: ${colors.colorCoreGray};
  position: absolute;
  top: ${dimensions.unitSpacing - 2}px;
  right: ${dimensions.coreSpacing - 3}px;
  font-size: 14px;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: 0;
  }
`;

export {
  FlexRow,
  FlexItem,
  SectionContainer,
  NoteFormContainer,
  ActivityLogContent,
  BasicInfo,
  SidebarCollapse,
  TabContent
};
