import React from "react";
import Select, { components } from "react-select";

import Icon from "@erxes/ui/src/components/Icon";
import { __ } from "@erxes/ui/src/utils/core";
import { IJobCategory } from "../../types";
import styled from "styled-components";

const CategoryContainer = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

type Props = {
  categories: IJobCategory[];
  onChangeCategory: (categoryId: string) => void;
};

type State = {
  categoryId?: string;
};

class JobCategoryChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: "",
    };
  }

  selectOptions(categories: IJobCategory[]) {
    return categories.map((item) => ({
      value: item._id,
      label: item.name,
      order: item.order,
      isRoot: item.isRoot,
    }));
  }

  onChange = (categoryId) => {
    this.setState({ categoryId });
    this.props.onChangeCategory(categoryId);
  };

  renderOptions = (option) => {
    const name = option.isRoot ? (
      <strong>{option.label}</strong>
    ) : (
      <>
        <Icon icon="angle-right-b" />
        {option.label}
      </>
    );
    const order = option.order.match(/[/]/gi);
    let space = "";

    if (order) {
      space = "\u00A0 ".repeat(order.length);
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
    const onChangeCategory = (option) => this.onChange(option.value);
    const Option = (props) => {
      return (
        <components.Option {...props}>
          {this.renderOptions(props.data)}
        </components.Option>
      );
    };

    return (
      <CategoryContainer>
        <Select
          required={true}
          placeholder={__("Choose a category")}
          components={{ Option }}
          options={this.selectOptions(categories)}
          value={this.selectOptions(categories).find(
            (o) => o.value === this.state.categoryId
          )}
          onChange={onChangeCategory}
          isClearable={false}
        />
      </CategoryContainer>
    );
  }
}

export default JobCategoryChooser;
