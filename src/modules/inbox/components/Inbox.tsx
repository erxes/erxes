import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import { AdditionalSidebar, Contents } from 'modules/layout/styles';
import * as React from 'react';
import { ConversationDetail } from '../containers/conversationDetail';
import { Sidebar } from '../containers/leftSidebar';

type Props = {
  queryParams: any;
  currentConversationId: string;
};

function Inbox({ currentConversationId, queryParams }: Props) {
  const breadcrumb = [{ title: __('Inbox') }];

  return (
    <Contents>
      <Header
        queryParams={queryParams}
        breadcrumb={breadcrumb}
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
