import React from 'react';
import { Row as CommonRow } from '../../common/components';
import GroupForm from './Form';

class Row extends CommonRow {
  constructor(props) {
    super(props);

    this.size = 'lg';
  }

  renderForm(props) {
    return <GroupForm {...props} />;
  }

  render() {
    const { object } = this.props;
    const { name, description } = object;

    return (
      <tr>
        <td>{name}</td>
        <td>{description}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
