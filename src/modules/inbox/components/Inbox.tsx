import { AppConsumer } from 'appContext';
import { __ } from 'modules/common/utils';
import { Header } from 'modules/layout/components';
import { Contents } from 'modules/layout/styles';
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
    <AppConsumer>
      {({ can }) => {
        const menuInbox = [{ title: 'Inbox', link: '/inbox' }];

        if (can('showInsights')) {
          menuInbox.push({ title: 'Insights', link: '/insights' });
        }

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
      }}
    </AppConsumer>
  );
}

export default Inbox;
