import React from 'react';
import { Table } from 'react-bootstrap';
import { List as CommonList } from '/imports/react-ui/settings/common/components';
import TopicRow from './Row';
import { TopicForm as topicFormComposer } from '../../containers';

class TopicList extends CommonList {
  constructor(props) {
    super(props);

    this.title = 'Add topic';
  }

  renderRow(props) {
    return <TopicRow {...props} />;
  }

  renderForm(props) {
    const { object } = props;
    const TopicForm = topicFormComposer({ object });

    return <TopicForm {...props} />;
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
    ];
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
