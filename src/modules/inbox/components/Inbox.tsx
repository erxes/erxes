import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { can } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import { Contents } from 'modules/layout/styles';
import React from 'react';

const Sidebar = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar" */ '../containers/leftSidebar/Sidebar')
);

const ConversationDetail = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-ConversationDetail" */ '../containers/conversationDetail/ConversationDetail')
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

  return (
    <Contents>
      <Header
        title={'Conversation'}
        queryParams={queryParams}
        submenu={menuInbox}
      />
      <Sidebar
        queryParams={queryParams}
        currentConversationId={currentConversationId}
      />
      <ConversationDetail currentId={currentConversationId} />
    </Contents>
  );
}

export default Inbox;
