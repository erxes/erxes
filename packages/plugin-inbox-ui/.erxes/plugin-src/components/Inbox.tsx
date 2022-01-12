import { IUser } from '@erxes/ui/src/auth/types';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Header from '@erxes/ui/src/layout/components/Header';
import { Contents, HeightedWrapper } from '@erxes/ui/src/layout/styles';
import MailForm from '@erxes/ui-settings/src/integrations/containers/mail/MailForm';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

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
  const menuInbox = [{ title: 'Team Inbox', link: '/inbox/index' }];

  const content = () => <MailForm isReply={false} clearOnSubmit={true} />;

  const sendEmail = (
    <ModalTrigger
      dialogClassName='middle'
      title='Send an Email'
      trigger={<span>{__('Send an Email')}</span>}
      size='lg'
      content={content}
      paddingContent='less-padding'
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
