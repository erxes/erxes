import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table, ActionButtons, Tip, Button } from 'modules/common/components';

const propTypes = {
  apps: PropTypes.array.isRequired,
  removeApp: PropTypes.func
};

class MessengerApps extends Component {
  renderRow(app) {
    const { removeApp } = this.props;
    const { __ } = this.context;

    return (
      <tr key={app._id}>
        <td>{app.name}</td>
        <td>{app.kind}</td>
        <td>
          <ActionButtons>
            <Tip text={__('Delete')}>
              <Button
                btnStyle="link"
                onClick={() => removeApp(app)}
                icon="cancel-1"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { apps } = this.props;
    const { __ } = this.context;

    return (
      <Fragment>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Kind')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{apps.map(i => this.renderRow(i))}</tbody>
        </Table>
      </Fragment>
    );
  }
}

MessengerApps.propTypes = propTypes;
MessengerApps.contextTypes = {
  __: PropTypes.func
};

export default MessengerApps;
