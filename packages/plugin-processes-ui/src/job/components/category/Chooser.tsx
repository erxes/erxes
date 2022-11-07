import React from 'react';
import Select from 'react-select-plus';

import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import { IJobCategory } from '../../types';
import styled from 'styled-components';

const CategoryContainer = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

type Props = {
  categories: IJobCategory[];
  onChangeCategory: (catgeoryId: string) => void;
};

type State = {
  categoryId?: string;
};

class JobCategoryChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: ''
    };
  }

  selectOptions(categories: IJobCategory[]) {
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

export default JobCategoryChooser;
