import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { EmptyState } from 'modules/common/components';
import { Sidebar } from 'modules/inbox/containers/leftSidebar';

class Empty extends Component {
  render() {
    const { queryParams } = this.props;

    const { __ } = this.context;

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
        leftSidebar={<Sidebar />}
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
