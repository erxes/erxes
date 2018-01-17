import React from 'react';
import { Table } from 'modules/common/components';
import { List } from '../../common/components';
import { Row } from '../containers';
import Form from './Form';

class FormList extends List {
  constructor(props) {
    super(props);

    this.title = 'New form';
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  renderForm(props) {
    return <Form {...props} />;
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Description</th>
            <th width="135">Created At</th>
            <th width="180">Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [{ title: 'Settings', link: '/settings' }, { title: 'Forms' }];
  }
}

export default FormList;
