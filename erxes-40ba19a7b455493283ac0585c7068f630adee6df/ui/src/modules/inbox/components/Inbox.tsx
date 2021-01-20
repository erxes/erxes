import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { can } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import { Contents, HeightedWrapper } from 'modules/layout/styles';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';

const Sidebar = asyncComponent(() =>
  import(
    /* webpackChunkName:"Inbox-Sidebar" */ '../containers/leftSidebar/Sidebar'
  )
);

const ConversationDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConversationDetail" */ '../containers/conversationDetail/ConversationDetail'
    ),
  { height: 'auto', width: '100%', color: '#fff', margin: '10px 10px 10px 0' }
);

type Props = {
  queryParams: any;
  currentConversationId: string;
  currentUser: IUser;
};

function Inbox({ currentConversationId, queryParams, currentUser }: Props) {
  const menuInbox = [
    { title: 'Team Inbox', link: '/inbox/index' },
    { title: 'Ticket', link: '/inbox/ticket' }
  ];

  if (can('showInsights', currentUser)) {
    menuInbox.push({ title: 'Insights', link: '/inbox/insights' });
  }

  const content = () => <MailForm isReply={false} clearOnSubmit={true} />;

  const sendEmail = (
    <ModalTrigger
      dialogClassName="middle"
      title="Send an Email"
      trigger={<span>Send an Email</span>}
      size="lg"
      content={content}
      paddingContent="less-padding"
      enforceFocus={false}
    />
  );

  return (
    <HeightedWrapper>
      <Header
        title={'Conversation'}
        queryParams={queryParams}
        submenu={menuInbox}
        additionalMenuItem={sendEmail}
      />
      <Contents>
        <Sidebar
          queryParams={queryParams}
          currentConversationId={currentConversationId}
        />
        <ConversationDetail currentId={currentConversationId} />
      </Contents>
    </HeightedWrapper>
  );
}

export default Inbox;
