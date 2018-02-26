import React from 'react';
import { Row as CommonRow } from '../../common/components';
import { UserForm } from '../containers';
import { NameCard } from 'modules/common/components';

class Row extends CommonRow {
  constructor(props) {
    super(props);

    this.size = 'lg';
  }

  renderForm(props) {
    return <UserForm {...props} />;
  }

  renderRole() {
    const { object } = this.props;

    if (object.isOwner) {
      return 'owner';
    }

    return object.role;
  }

  render() {
    const { object } = this.props;
    const { email } = object;

    return (
      <tr>
        <td>
          <NameCard user={object} avatarSize={30} singleLine />
        </td>
        <td>{email}</td>
        <td>{this.renderRole()}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
