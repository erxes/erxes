import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'modules/common/components';
import { List } from '../../common/components';
import GroupForm from './Form';
import Row from './Row';

class GroupList extends List {
  constructor(props) {
    super(props);

    this.title = 'New group';
    this.size = 'lg';
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  renderForm(props) {
    return <GroupForm {...props} />;
  }

  renderContent() {
    const { __ } = this.context;
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Description')}</th>
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

GroupList.contextTypes = {
  __: PropTypes.func
};

export default GroupList;
