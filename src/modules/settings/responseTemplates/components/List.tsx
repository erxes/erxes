import { Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
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
            <th>{__('Brand')}</th>
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
      { title: __('Response templates') }
    ];
  }
}

export default ResponseTemplateList;
