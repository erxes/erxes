import React from 'react';
import SelectCategory from '@erxes/ui-forms/src/settings/properties/containers/SelectProductCategory';
class Form extends React.Component<any, any> {
  constructor(props) {
    super(props);

    const config = props.config || {};

    this.state = {
      selectCategories: config.categories || []
    };
  }

  onChange = categories => {
    // this.props.onChangeItems(boardsPipelines);
    this.setState({ selectCategories: categories }, () => {
      this.props.onChangeItems(categories, 'categories');
    });
  };

  render() {
    return (
      <SelectCategory
        onChange={this.onChange}
        defaultValue={this.state.selectCategories}
      />
    );
  }
}

export default Form;
