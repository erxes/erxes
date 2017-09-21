import React from 'react';
import { Row as CommonRow } from '/imports/react-ui/settings/common/components';
import { CategoryForm as categoryFormComposer } from '../../containers';

class CategoryRow extends CommonRow {
  renderForm(props) {
    const { object } = props;
    const CategoryForm = categoryFormComposer({ object });

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
