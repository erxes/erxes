import { IUser } from 'modules/auth/types';
import { EmptyState } from 'modules/common/components';
import { __, can } from 'modules/common/utils';
import { Sidebar } from 'modules/inbox/containers/leftSidebar';
import { Wrapper } from 'modules/layout/components';
import React from 'react';

type Props = {
  queryParams?: any;
  currentUser: IUser;
};

function Empty({ queryParams, currentUser }: Props) {
  const menuInbox = [
    { title: 'Inbox', link: '/inbox/index' },
    { title: 'Ticket', link: '/inbox/ticket' }
  ];

  if (can('showInsights', currentUser)) {
    menuInbox.push({ title: 'Insights', link: '/inbox/insights' });
  }

  const content = (
    <EmptyState
      text="Whoops! No messages here but you can always start"
      size="full"
      image="/images/actions/12.svg"
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Inbox')}
          queryParams={queryParams}
          submenu={menuInbox}
        />
      }
      content={content}
      leftSidebar={<Sidebar queryParams={queryParams} />}
    />
  );
}

export default Empty;
