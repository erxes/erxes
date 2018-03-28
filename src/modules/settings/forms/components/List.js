import React from 'react';
import PropTypes from 'prop-types';
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
    const { __ } = this.context;
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Code')}</th>
            <th>{__('Description')}</th>
            <th width="135">{__('Created At')}</th>
            <th width="180">{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    const { __ } = this.context;
    return [{ title: __('Settings'), link: '/settings' }, { title: 'Forms' }];
  }
}

FormList.contextTypes = {
  __: PropTypes.func
};

export default FormList;
