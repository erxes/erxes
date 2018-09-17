import { Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { List, RowActions } from '../../common/components';
import { ICommonListProps } from '../../common/types';
import UserForm from './UserForm';

class UserList extends React.Component<ICommonListProps> {
  constructor(props) {
    super(props);

    this.renderContent = this.renderContent.bind(this);
  }

  renderRows({ objects }) {
    return objects.map((object, index) => (
      <tr key={index}>
        <td>{object.name}</td>
        <RowActions
          {...this.props}
          object={object}
          renderForm={(props) =>
            <UserForm {...props} />
          }
        />
      </tr>
    ));
  }

  renderContent(props) {
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
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [
      { title: __('Settings'), link: '/settings' },
      { title: __('Team members') }
    ];
  }

  render() {
    return (
      <List
        title="New user"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Team members') }
        ]}
        renderForm={(props) => <UserForm {...props} />}
        renderContent={this.renderContent}
        {...this.props}
      />
    );
  }
}

export default UserList;
