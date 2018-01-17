import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntegrationRow } from '/';
import { Table } from 'modules/common/components';

const propTypes = {
  integrations: PropTypes.array.isRequired
};

class IntegrationList extends Component {
  renderObjects() {
    const { integrations } = this.props;

    return integrations.map(integration =>
      this.renderRow({
        key: integration._id,
        integration
      })
    );
  }

  renderRow(props) {
    return <IntegrationRow {...props} />;
  }

  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Brand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }
}

IntegrationList.propTypes = propTypes;

export default IntegrationList;
