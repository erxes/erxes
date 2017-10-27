import React from 'react';
import { Table } from 'modules/common/components';
import { List } from '../../common/components';
import Form from './Form';
import Row from './Row';

class EmailTemplateList extends List {
  constructor(props) {
    super(props);

    this.title = 'New email template';
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
            <th width="140" />
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
      { title: 'Settings', link: '/settings/email-templates' },
      { title: 'Email templates' }
    ];
  }
}

export default EmailTemplateList;
