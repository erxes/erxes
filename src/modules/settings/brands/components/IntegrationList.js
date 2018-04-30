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
    const { __ } = this.context;
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Kind')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  }
}

IntegrationList.propTypes = propTypes;
IntegrationList.contextTypes = {
  __: PropTypes.func
};

export default IntegrationList;
