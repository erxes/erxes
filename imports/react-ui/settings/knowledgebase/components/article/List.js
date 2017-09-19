import React from 'react';
import { Table } from 'react-bootstrap';
import { List } from '/imports/react-ui/settings/common/components';
import ArticleRow from './Row';
import { ArticleForm } from '../../containers';

class ArticleList extends List {
  constructor(props) {
    super(props);

    this.title = 'Add article';
  }

  renderRow(props) {
    return <ArticleRow {...props} />;
  }

  renderForm(props) {
    return <ArticleForm {...props} />;
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
        title: 'Articles',
        link: '/settings/knowledgebase/articles',
      },
    ];
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Summary</th>
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
export default ArticleList;
