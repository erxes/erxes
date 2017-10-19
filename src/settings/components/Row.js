import React from 'react';
import { Label } from 'react-bootstrap';
import { Row as CommonRow } from '../common/components';
import { ChannelForm } from '../components';

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
          <Label bsStyle="success">Active</Label>
        </td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
