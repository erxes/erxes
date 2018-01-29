import React from 'react';
import { Row as CommonRow } from '../../../common/components';
import { TopicForm } from '../../containers';

class TopicRow extends CommonRow {
  renderForm(props) {
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
