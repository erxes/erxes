import * as React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'modules/common/components';
import { List } from '../../common/components';
import { UserForm } from '../containers';
import Row from './Row';

class UserList extends List {
  constructor(props) {
    super(props);

    this.title = 'New user';
    this.size = 'lg';
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  renderForm(props) {
    return <UserForm {...props} />;
  }

  renderContent() {
    const { __ } = this.context;
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Full name')}</th>
            <th>{__('Email')}</th>
            <th>{__('Role')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    const { __ } = this.context;
    return [
      { title: __('Settings'), link: '/settings' },
      { title: __('Team members') }
    ];
  }
}

UserList.contextTypes = {
  __: PropTypes.func
};

export default UserList;
