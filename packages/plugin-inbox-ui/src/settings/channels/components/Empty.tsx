import EmptyState from '@erxes/ui/src/components/EmptyState';
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import Sidebar from '../containers/Sidebar';

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
        text={__('There is no Channel') + '.'}
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
