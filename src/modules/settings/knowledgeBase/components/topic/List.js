import React from 'react';
import { Table } from 'modules/common/components';
import { List as CommonList } from '../../../common/components';
import TopicRow from './Row';
import { TopicForm } from '../../containers';

class TopicList extends CommonList {
  constructor(props) {
    super(props);

    this.title = 'Add topic';
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
        title: 'Topic'
      }
    ];
  }

  renderRow(props) {
    return <TopicRow {...props} />;
  }

  renderForm(props) {
    return <TopicForm {...props} />;
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Brand</th>
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

export default TopicList;
