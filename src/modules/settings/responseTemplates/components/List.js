import React from 'react';
import { Table } from 'react-bootstrap';
import { List } from '../../common/components';
import { Form } from '../containers';
import Row from './Row';

class ResponseTemplateList extends List {
  constructor(props) {
    super(props);

    this.title = 'New response template';
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
            <th>Brand</th>
            <th>Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [
      { title: 'Settings', link: '/settings/response-templates' },
      { title: 'Response templates' }
    ];
  }
}

export default ResponseTemplateList;
