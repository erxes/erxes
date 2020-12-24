import { SectionContainer, SidebarCollapse } from 'erxes-ui/lib/layout/styles';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  ActivityTitle,
  AvatarWrapper,
  CenterText,
  Collapse,
  ConversationContent,
  Count,
  DeleteAction,
  EmailContent,
  FlexBody,
  FlexCenterContent,
  FlexContent,
  Header,
  Row,
  Timeline
} from 'modules/activityLogs/styles';
import { colors, dimensions, typography } from 'modules/common/styles';
import { ActivityContent, DateContainer } from 'modules/common/styles/main';
import {
  SpaceBetweenRow,
  Subject
} from 'modules/settings/integrations/components/mail/styles';
import styled from 'styled-components';
import { CardItem } from '../workarea/conversation/messages/bot/styles';
import {
  FormTable,
  MessageBody,
  MessageContent,
  MessageItem,
  UserInfo
} from '../workarea/conversation/styles';
import {
  AttachmentItem,
  AttachmentsContainer,
  Content,
  Details,
  Meta,
  Reply,
  RightSide
} from '../workarea/mail/style';

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
  padding: 0 16px;
  margin-bottom: ${dimensions.coreSpacing}px;

  img {
    max-width: 100%;
  }

  ${Timeline} {
    padding-left: 0;

    &:before {
      display: none;
    }
  }

  ${Collapse} {
    padding: 16px;
  }

  ${Header} {
    font-size: 13px;
    word-break: break-word;
  }

  ${AvatarWrapper}, 
  ${MessageItem} > span, 
  ${Meta} > span,
  ${ConversationContent},
  ${Count} {
    display: none;
  }

  ${ActivityIcon} {
    left: -8px;
    width: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 11px;
    top: -8px;
    z-index: 1;
  }

  ${ActivityTitle} {
    padding: ${dimensions.coreSpacing}px 0;
    font-weight: 500;
  }

  ${ActivityRow} {
    box-shadow: none;
    background: ${colors.bgActive};
    border-radius: 4px;
    margin-bottom: 16px;

    &:hover {
      background: ${colors.bgActive};
    }
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
    padding: 8px 16px;
  }

  ${MessageBody} {
    margin: 0;
    flex-direction: column;
    align-items: flex-start;

    footer {
      display: none;
    }
  }

  ${FlexContent} {
    flex-direction: column;
  }

  ${Row} {
    margin-right: 0;
    margin-bottom: 20px;
  }

  ${FlexBody} {
    align-self: baseline;
  }

  ${Meta}, ${FlexCenterContent}, ${FlexBody} {
    flex-direction: column;
    align-items: baseline;
  }

  ${CenterText} {
    font-size: 12px;
  }

  ${DeleteAction} {
    visibility: visible;
  }

  //Bot
  ${CardItem} {
    width: 100%;
    margin-right: 0;
  } 

  // form
  ${FormTable} {
    overflow: auto;

    td {
      white-space: nowrap;
    }
  }

  // email
  ${Meta} {
    padding: 8px;
  }

  ${Details} {
    align-self: normal;
    margin: 0;
    word-break: break-word;
  }

  ${RightSide} {
    margin-left: 0;
    padding: 0;
  }

  ${Reply} {
    padding: 8px 16px;
    display: flex;
    flex-direction: column;

    > button {
      margin: 0 4px
    }
  }

  ${AttachmentsContainer} {
    margin: 0 16px 8px 16px
  }

  ${AttachmentItem} {
    width: 180px;
    margin: 8px 0px 0px 0px;
  }

  ${Content} {
    padding: 8px 16px;

    > div {
      min-width: 300px;
    }
  }

  //email form 
  ${SpaceBetweenRow} {
    flex-direction: column;

    > a {
      padding-left: 0;
    }

    button {
      width: 100%;
      margin: 4px 0;
    }
  }

  ${Subject} {
    padding: 8px 16px;
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
