import React from 'react';
import { Row as CommonRow } from '/imports/react-ui/settings/common/components';
import { TopicForm as topicFormComposer } from '../../containers';

class TopicRow extends CommonRow {
  renderForm(props) {
    const { object } = props;
    const TopicForm = topicFormComposer({ object });

    return <TopicForm {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>{object.title}</td>
        <td>{object.description}</td>
        <td>{object.brand.name}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default TopicRow;
