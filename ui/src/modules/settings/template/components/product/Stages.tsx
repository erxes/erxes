import { IProductTemplateItem } from '../../types';
import Icon from 'modules/common/components/Icon';
import SortableList from 'modules/common/components/SortableList';
import { __ } from 'modules/common/utils';
import { LinkButton } from 'modules/settings/team/styles';
import React from 'react';
import StageItem from './StageItem';
import { IProductCategory } from 'modules/settings/productService/types';

type Props = {
  onChangeItems: (items: IProductTemplateItem[]) => void;
  productCategories?: IProductCategory[];
  items: any;
  type?: string;
};

class Stages extends React.Component<Props, {}> {
  componentDidMount() {
    if (this.props.items.length === 0) {
      this.add();
    }
  }

  onChange = (_id: string, name: string, value: any) => {
    const { items, onChangeItems } = this.props;

    const item = items.find(s => s._id === _id);
    item[name] = value;

    onChangeItems(items);
  };

  add = () => {
    const { items, onChangeItems } = this.props;

    items.push({
      _id: Math.random().toString(),
      categoryId: "",
      itemId: "",
      unitPrice: 0,
      quantity: 0,
      discount: 0
    });

    onChangeItems(items);
  };

  remove = _id => {
    const { items, onChangeItems } = this.props;
    const remainedItems = items.filter(item => item._id !== _id);

    onChangeItems(remainedItems);
  };

  render() {
    const { type, productCategories } = this.props;
    const Item = StageItem;

    const child = item => (
      <Item
        item={item}
        type={type}
        productCategories={productCategories}
        onChange={this.onChange}
        remove={this.remove}
      />
    );

    return (
      <>
        <SortableList
          fields={this.props.items}
          child={child}
          onChangeFields={this.props.onChangeItems}
          isModal={true}
          droppableId=""
        />

        <LinkButton onClick={this.add}>
          <Icon icon="plus-1" /> {__('Add more')}
        </LinkButton>
      </>
    );
  }
}

export default Stages;
