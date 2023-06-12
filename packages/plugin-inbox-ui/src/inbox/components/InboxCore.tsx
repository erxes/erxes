import { Contents, HeightedWrapper } from '@erxes/ui/src/layout/styles';

import Header from '@erxes/ui/src/layout/components/Header';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

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
};

class Inbox extends React.Component<Props> {
  render() {
    const { currentConversationId, queryParams } = this.props;

    const menuInbox = [{ title: 'Team Inbox', link: '/inbox/index' }];

    const content = () => (
      <MailForm
        isReply={false}
        clearOnSubmit={true}
        source={isEnabled('imap') ? 'inbox' : undefined}
      />
    );

    return (
      <HeightedWrapper>
        <Header
          title={'Conversation'}
          queryParams={queryParams}
          submenu={menuInbox}
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
}

export default Inbox;
