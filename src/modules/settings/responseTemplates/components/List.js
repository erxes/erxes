import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'modules/common/components';
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
    const { __ } = this.context;
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
    const { __ } = this.context;
    return [
      { title: __('Settings'), link: '/settings' },
      { title: __('Response templates') }
    ];
  }
}

ResponseTemplateList.contextTypes = {
  __: PropTypes.func
};

export default ResponseTemplateList;
