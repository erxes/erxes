import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { EmptyState } from 'modules/common/components';
import { Sidebar } from '../containers';

class Empty extends Component {
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

Empty.propTypes = {
  queryParams: PropTypes.object
};

Empty.contextTypes = {
  __: PropTypes.func
};

export default Empty;
