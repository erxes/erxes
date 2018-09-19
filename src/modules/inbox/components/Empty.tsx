import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/inbox/containers/leftSidebar';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';

type Props = {
  queryParams: any;
};

class Empty extends React.Component<Props> {
  render() {
    const { queryParams } = this.props;

    const content = (
      <EmptyState
        text="There is no message."
        size="full"
        image="/images/robots/robot-02.svg"
      />
    );

    const breadcrumb = [{ title: __('Inbox') }];

    return (
      <Wrapper
        header={
          <Wrapper.Header queryParams={queryParams} breadcrumb={breadcrumb} />
        }
        content={content}
        leftSidebar={<Sidebar queryParams={queryParams} />}
      />
    );
  }
}

export default Empty;
