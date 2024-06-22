import React from "react";
import Select, { components } from "react-select";

import Icon from "@erxes/ui/src/components/Icon";
import { __ } from "@erxes/ui/src/utils/core";
import { CategoryContainer } from "../styles";
import { IProductCategory } from "../types";
import { IOption } from "@erxes/ui/src/types";

type Props = {
  categories: IProductCategory[];
  currentId?: string;
  hasChildIds?: boolean;
  onChangeCategory: (categoryId: string, childIds?: string[]) => void;
  customOption?: IOption;
};

type State = {
  categoryId?: string;
  clear?: boolean;
};

class ProductCategoryChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: this.props.currentId || "",
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { currentId } = this.props;
    if (prevProps.currentId) {
      if (currentId === "") {
        this.setState({ categoryId: "" });
      }
    }
  }

  selectOptions(categories: IProductCategory[]) {
    const { customOption } = this.props;
    const options = categories.map((item) => ({
      value: item._id,
      label: item.name,
      order: item.order,
      isRoot: item.isRoot,
    }));

    if (customOption) {
      options.unshift({ ...customOption, order: "0", isRoot: true });
    }

    return options;
  }

  onChange = (categoryId: string) => {
    const { categories, hasChildIds } = this.props;

    let childIds: string[] = [];

    if (hasChildIds) {
      const foundCategory = categories.find((c) => c._id === categoryId);

      if (foundCategory) {
        const childs = categories.filter((c) =>
          c.order.startsWith(foundCategory.order)
        );

        if (childs.length) {
          childIds = childIds.concat(childs.map((ch) => ch._id));
        }
      }
    }

    this.setState({ categoryId });
    this.props.onChangeCategory(categoryId, childIds);
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
    const onChangeCategory = (option) => this.onChange(option?.value);

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
            (option) => option.value === this.state.categoryId
          )}
          onChange={onChangeCategory}
          isClearable={false}
        />
      </CategoryContainer>
    );
  }
}

export default ProductCategoryChooser;
