import { EmptyState } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Sidebar } from '../containers';

type Props = {
  queryParams: any
}

class Empty extends Component<Props, {}> {
  static contextTypes =  {
    __: PropTypes.func
  }

  render() {
    const { queryParams } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Channels'), link: '/settings/channels' }
    ];

    const content = (
      <EmptyState
        text="There is no channel."
        size="full"
        image="/images/robots/robot-02.svg"
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar queryParams={queryParams} />}
        content={content}
      />
    );
  }
}

export default Empty;
