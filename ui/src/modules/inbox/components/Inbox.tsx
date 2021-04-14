import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
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

  const content = () => <MailForm isReply={false} clearOnSubmit={true} />;

  const sendEmail = (
    <ModalTrigger
      dialogClassName="middle"
      title={__('Send an Email')}
      trigger={<span>{__('Send an Email')}</span>}
      size="lg"
      content={content}
      paddingContent="less-padding"
      enforceFocus={false}
    />
  );

  return (
    <HeightedWrapper>
      <Header
        title={__('Conversation')}
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
