import React from 'react';
import { Row as CommonRow } from '../../common/components';
import { Label } from 'modules/common/components';
import { ChannelForm } from '../containers';

class Row extends CommonRow {
  renderForm(props) {
    return <ChannelForm {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>{object.name}</td>
        <td>{object.description}</td>
        <td>
          <Label lblStyle="success">Active</Label>
        </td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
