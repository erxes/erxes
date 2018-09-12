import { Table } from 'modules/common/components';
import PropTypes from 'prop-types';
import * as React from 'react';
import { List } from '../../common/components';
import Form from './Form';
import Row from './Row';

class EmailTemplateList extends List {
  static contextTypes =  {
    __: PropTypes.func
  }

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
    const { __ } = this.context;
    return (
      <Table>
        <thead>
          <tr>
            <th width="140" />
            <th>{__('Name')}</th>
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
      { title: __('Email templates') }
    ];
  }
}

export default EmailTemplateList;
