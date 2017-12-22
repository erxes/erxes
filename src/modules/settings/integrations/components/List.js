import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Pagination, Table, ShowData } from 'modules/common/components';
import Sidebar from '../../Sidebar';
import { AddIntegration } from '../components';
import Row from './Row';

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

    const actionBar = <Wrapper.ActionBar right={<AddIntegration />} />;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Brand</th>
            <th width="183">Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderIntegrations()}</tbody>
      </Table>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <ShowData
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

export default List;
