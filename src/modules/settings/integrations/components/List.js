import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header, ActionBar, PageContent } from 'modules/layout/components';
import { Pagination, Table } from 'modules/common/components';
import { AddIntegration } from '../components';
import Row from './Row';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired
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
    const { totalCount } = this.props;

    const actionBar = <ActionBar right={<AddIntegration />} />;

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

    return [
      <Header key="breadcrumb" breadcrumb={breadcrumb} />,
      <PageContent
        key="settings-content"
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
      >
        {content}
      </PageContent>
    ];
  }
}

List.propTypes = propTypes;

export default List;
