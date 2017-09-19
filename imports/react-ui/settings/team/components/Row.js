import React from 'react';
import { Row as CommonRow } from '../../common/components';
import { UserForm } from '../containers';

class Row extends CommonRow {
  renderForm(props) {
    return <UserForm {...props} />;
  }

  renderRole() {
    const { object } = this.props;

    if (object.isOwner) {
      return 'owner';
    }

    return object.details.role;
  }

  render() {
    const { object } = this.props;
    const { details, emails } = object;

    return (
      <tr>
        <td>{details.fullName}</td>
        <td>{emails[0].address}</td>
        <td>
          {this.renderRole()}
        </td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
