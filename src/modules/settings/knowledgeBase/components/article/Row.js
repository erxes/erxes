import React from 'react';
import { Row as CommonRow } from '../../../common/components';
import { ArticleForm } from '../../components';

class ArticleRow extends CommonRow {
  constructor(props) {
    super(props);

    this.size = 'large';
  }

  renderForm(props) {
    return <ArticleForm {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>{object.title}</td>
        <td>{object.summary}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default ArticleRow;
