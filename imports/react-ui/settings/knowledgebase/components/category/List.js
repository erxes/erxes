import React from 'react';
import { Table } from 'react-bootstrap';
import { List as CommonList } from '/imports/react-ui/settings/common/components';
import CategoryRow from './Row';
import { CategoryForm } from '../../containers';

class CategoryList extends CommonList {
  constructor(props) {
    super(props);

    this.title = 'Add category';
  }

  renderRow(props) {
    return <CategoryRow {...props} />;
  }

  renderForm(props) {
    return <CategoryForm {...props} />;
  }

  breadcrumb() {
    return [
      {
        title: 'Settings',
        link: '/settings/channels',
      },
      {
        title: 'Knowledge base',
        link: '/settings/knowledgebase',
      },
      {
        title: 'Categories',
        link: '/settings/knowledgebase/categories',
      },
    ];
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th width="183" className="text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }
}

export default CategoryList;
