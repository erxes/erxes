import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Pagination, Table, DataWithLoader } from 'modules/common/components';
import { AddIntegration } from '../components';
import Row from './Row';
import Sidebar from '../Sidebar';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderIntegrations = this.renderIntegrations.bind(this);
  }

  renderIntegrations() {
    const { integrations, refetch, removeIntegration } = this.props;

    return integrations.map(integration => (
      <Row
        key={integration._id}
        integration={integration}
        refetch={refetch}
        removeIntegration={removeIntegration}
      />
    ));
  }

  render() {
    const { totalCount, loading } = this.props;
    const { __ } = this.context;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Kind')}</th>
            <th>{__('Brand')}</th>
            <th width="183">{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderIntegrations()}</tbody>
      </Table>
    );

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
            data={content}
            loading={loading}
            count={totalCount}
            emptyText="There is no data."
            emptyIcon="ios-copy"
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
