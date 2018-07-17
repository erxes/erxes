import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'modules/common/components';
import { IntegrationRow } from './';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func,
  refetch: PropTypes.func,
  showBrand: PropTypes.bool
};

class IntegrationList extends Component {
  renderRow() {
    const { integrations, refetch, showBrand, removeIntegration } = this.props;

    return integrations.map(integration => (
      <IntegrationRow
        key={integration._id}
        integration={integration}
        refetch={refetch}
        showBrand={showBrand}
        removeIntegration={removeIntegration}
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
            {this.props.showBrand && <th>{__('Brand')}</th>}
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
