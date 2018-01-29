import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'modules/common/components';
import { IntegrationRow } from '/';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  refetch: PropTypes.func
};

class IntegrationList extends Component {
  renderRow() {
    const { integrations, refetch } = this.props;

    return integrations.map(integration => (
      <IntegrationRow
        key={integration._id}
        integration={integration}
        refetch={refetch}
      />
    ));
  }

  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  }
}

IntegrationList.propTypes = propTypes;

export default IntegrationList;
