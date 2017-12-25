import React from 'react';
import { Row as CommonRow } from '../common';
import { Label } from 'modules/common/components';
import { ChannelForm } from '../containers';

class Row extends CommonRow {
  renderForm(props) {
    return <ChannelForm {...props} />;
  }

  render() {
    const { integration } = this.props;
    // console.log(integration)
    return (
      <tr>
        <td>{integration.name}</td>
        <td>{integration.name}</td>
        <td>
          <Label lblStyle="success">.</Label>
        </td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
