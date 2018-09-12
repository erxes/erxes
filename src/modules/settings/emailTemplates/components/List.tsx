import { Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
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
            <th />
            <th>{__('Name')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [
      { title: __('Settings'), link: '/settings' },
      { title: __('Email templates') }
    ];
  }
}

export default EmailTemplateList;
