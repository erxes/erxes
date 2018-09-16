import * as React from 'react';
import { Row as CommonRow } from '../../common/components';
import { Form } from '../containers';

class Row extends CommonRow {
  renderForm(props) {
    return <Form {...props} />;
  }

  render() {
    const { object } = this.props;
    const brand = object.brand || {};

    return (
      <tr>
        <td>{brand.name}</td>
        <td>{object.name}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
