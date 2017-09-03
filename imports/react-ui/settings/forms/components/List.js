import React from 'react';
import { Table } from 'react-bootstrap';
import { List } from '../../common/components';
import Form from './Form';
import Row from './Row';

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
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.renderObjects()}
        </tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [{ title: 'Settings', link: '/settings/forms' }, { title: 'Forms' }];
  }
}

export default FormList;
