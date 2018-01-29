import React from 'react';
import { Table } from 'modules/common/components';
import { List as CommonList } from 'modules/settings/common/components';
import CategoryRow from './Row';
import { CategoryForm } from '../../containers';

class CategoryList extends CommonList {
  constructor(props) {
    super(props);

    this.title = 'Add category';
  }

  breadcrumb() {
    return [
      {
        title: 'Knowledge base',
        link: '/knowledgeBase/list'
      },
      {
        title: 'Categories'
      }
    ];
  }

  renderRow(props) {
    return <CategoryRow {...props} />;
  }

  renderForm(props) {
    return <CategoryForm {...props} />;
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th width="90">Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }
}

export default CategoryList;
