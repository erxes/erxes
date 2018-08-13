import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Pagination, DataWithLoader } from 'modules/common/components';
import { IntegrationList } from '../containers/common';
import { AddIntegration } from '../components';
import Sidebar from '../Sidebar';

const propTypes = {
  removeIntegration: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  queryParams: PropTypes.object
};

class List extends Component {
  render() {
    const { totalCount, loading, removeIntegration, queryParams } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={<Wrapper.ActionBar right={<AddIntegration />} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={
              <IntegrationList
                removeIntegration={removeIntegration}
                queryParams={queryParams}
                showBrand
              />
            }
            loading={loading}
            count={totalCount}
            emptyText="There is no data."
            emptyIcon="list-1"
          />
        }
      />
    );
  }
}

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
