import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { CategoryContainer } from 'modules/deals/styles';
import { IProductCategory } from 'modules/settings/productService/types';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  categories: IProductCategory[];
  onChangeCategory: (catgeoryId: string) => void;
};

type State = {
  categoryId?: string;
};

class ProductCategoryChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: ''
    };
  }

  selectOptions(categories: IProductCategory[]) {
    return categories.map(item => ({
      value: item._id,
      label: item.name,
      order: item.order,
      isRoot: item.isRoot
    }));
  }

  onChange = categoryId => {
    this.setState({ categoryId });
    this.props.onChangeCategory(categoryId);
  };

  renderOptions = option => {
    const name = option.isRoot ? (
      <strong>{option.label}</strong>
    ) : (
      <>
        <Icon icon="angle-right-b" />
        {option.label}
      </>
    );
    const order = option.order.match(/[/]/gi);
    let space = '';

    if (order) {
      space = '\u00A0 '.repeat(order.length);
    }

    return (
      <div className="simple-option">
        <span>
          {space}
          {name}
        </span>
      </div>
    );
  };

  render() {
    const { categories } = this.props;
    const onChangeCategory = option => this.onChange(option.value);

    return (
      <CategoryContainer>
        <FormGroup>
          <ControlLabel>Product category</ControlLabel>
          <Select
            isRequired={true}
            placeholder={__('Choose a category')}
            optionRenderer={this.renderOptions}
            options={this.selectOptions(categories)}
            value={this.state.categoryId}
            onChange={onChangeCategory}
            clearable={false}
          />
        </FormGroup>
      </CategoryContainer>
    );
  }
}

export default ProductCategoryChooser;
