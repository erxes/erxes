import React from 'react';
import { Row as CommonRow } from '../../../common/components';
import { CategoryForm } from '../../containers';

class CategoryRow extends CommonRow {
  renderForm(props) {
    return <CategoryForm {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>{object.title}</td>
        <td>{object.description}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default CategoryRow;
