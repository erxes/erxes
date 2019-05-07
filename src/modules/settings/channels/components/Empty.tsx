import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Sidebar } from '../containers';

type Props = {
  queryParams?: any;
};

class Empty extends React.Component<Props, {}> {
  render() {
    const { queryParams } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Channels'), link: '/settings/channels' }
    ];

    const content = (
      <EmptyState
        text="There is no channel."
        size="full"
        image="/images/actions/18.svg"
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Channels')} breadcrumb={breadcrumb} />
        }
        leftSidebar={<Sidebar queryParams={queryParams} />}
        content={content}
      />
    );
  }
}

export default Empty;
