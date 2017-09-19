import React from 'react';
import { Table } from 'react-bootstrap';
import { List } from '../../common/components';
import BrandForm from './BrandForm';
import Row from './Row';

class BrandList extends List {
  constructor(props) {
    super(props);

    this.title = 'New brand';
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  renderForm(props) {
    return <BrandForm {...props} />;
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
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [{ title: 'Settings', link: '/settings/brands' }, { title: 'Brands' }];
  }
}

export default BrandList;
