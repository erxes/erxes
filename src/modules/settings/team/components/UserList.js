import React from 'react';
import { Table } from 'modules/common/components';
import { List } from '../../common/components';
import { UserForm } from '../containers';
import Row from './Row';

class UserList extends List {
  constructor(props) {
    super(props);

    this.title = 'New user';
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  renderForm(props) {
    return <UserForm {...props} />;
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [
      { title: 'Settings', link: '/settings/team' },
      { title: 'Team members' }
    ];
  }
}

export default UserList;
