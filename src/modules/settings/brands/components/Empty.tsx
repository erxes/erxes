import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import React from 'react';
import { Sidebar } from '../containers';

type Props = {
  queryParams: any;
};

class Empty extends React.Component<Props> {
  render() {
    const { queryParams } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Brands'), link: '/settings/brands' }
    ];

    const content = (
      <EmptyState
        text="There is no brand."
        size="full"
        image="/images/actions/20.svg"
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Brands')} breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar queryParams={queryParams} />}
        content={content}
      />
    );
  }
}

export default Empty;
