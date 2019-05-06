import { IUser } from 'modules/auth/types';
import { __, can } from 'modules/common/utils';
import { Header } from 'modules/layout/components';
import { Contents } from 'modules/layout/styles';
import * as React from 'react';
import { ConversationDetail } from '../containers/conversationDetail';
import { Sidebar } from '../containers/leftSidebar';

type Props = {
  queryParams: any;
  currentConversationId: string;
  currentUser: IUser;
};

function Inbox({ currentConversationId, queryParams, currentUser }: Props) {
  const menuInbox = [{ title: 'Inbox', link: '/inbox/index' }];

  if (can('showInsights', currentUser)) {
    menuInbox.push({ title: 'Insights', link: '/inbox/insights' });
  }

  return (
    <Contents>
      <Header queryParams={queryParams} submenu={menuInbox} />
      <Sidebar
        queryParams={queryParams}
        currentConversationId={currentConversationId}
      />
      <ConversationDetail currentId={currentConversationId} />
    </Contents>
  );
}

export default Inbox;
