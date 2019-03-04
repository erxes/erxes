import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Sidebar } from 'modules/inbox/containers/leftSidebar';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';

type Props = {
  queryParams?: any;
};

function Empty({ queryParams }: Props) {
  const breadcrumb = [{ title: __('Inbox') }];

  const content = (
    <EmptyState
      text="There is no message."
      size="full"
      image="/images/actions/12.svg"
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          queryParams={queryParams}
          breadcrumb={breadcrumb}
          submenu={menuInbox}
        />
      }
      content={content}
      leftSidebar={<Sidebar queryParams={queryParams} />}
    />
  );
}

export default Empty;
