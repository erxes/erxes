import React from 'react';
import Select from 'react-select-plus';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import { CategoryContainer } from '../styles';
import { IAccountCategory } from '../types';

type Props = {
  categories: IAccountCategory[];
  currentId?: string;
  hasChildIds?: boolean;
  onChangeCategory: (categoryId: string, childIds?: string[]) => void;
};

type State = {
  categoryId?: string;
  clear?: boolean;
};

class AccountCategoryChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: this.props.currentId || ''
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { currentId } = this.props;
    if (prevProps.currentId) {
      if (currentId === '') {
        this.setState({ categoryId: '' });
      }
    }
  }

  selectOptions(categories: IAccountCategory[]) {
    return categories.map(item => ({
      value: item._id,
      label: item.name,
      order: item.order,
      isRoot: item.isRoot
    }));
  }

  onChange = (categoryId: string) => {
    const { categories, hasChildIds } = this.props;

    let childIds: string[] = [];

    if (hasChildIds) {
      const foundCategory = categories.find(c => c._id === categoryId);

      if (foundCategory) {
        const childs = categories.filter(c =>
          c.order.startsWith(foundCategory.order)
        );

        if (childs.length) {
          childIds = childIds.concat(childs.map(ch => ch._id));
        }
      }
    }

    this.setState({ categoryId });
    this.props.onChangeCategory(categoryId, childIds);
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
    const onChangeCategory = option => this.onChange(option?.value);

    return (
      <CategoryContainer>
        <Select
          isRequired={true}
          placeholder={__('Choose a category')}
          optionRenderer={this.renderOptions}
          options={this.selectOptions(categories)}
          value={this.state.categoryId}
          onChange={onChangeCategory}
          clearable={false}
        />
      </CategoryContainer>
    );
  }
}

export default AccountCategoryChooser;
