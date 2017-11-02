import React from 'react';
import { Table } from 'modules/common/components';
import { List as CommonList } from '../../../common/components';
import ArticleRow from './Row';
import { ArticleForm } from '../../components';

class ArticleList extends CommonList {
  constructor(props) {
    super(props);

    this.title = 'Add article';
    this.size = 'large';
  }

  breadcrumb() {
    return [
      {
        title: 'Settings',
        link: '/settings/channels'
      },
      {
        title: 'Knowledge base',
        link: '/settings/knowledgebase'
      },
      {
        title: 'Articles'
      }
    ];
  }

  renderRow(props) {
    return <ArticleRow {...props} />;
  }

  renderForm(props) {
    return <ArticleForm {...props} />;
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
