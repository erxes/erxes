import Icon from '@erxes/ui/src/components/Icon';
import SortableList from '@erxes/ui/src/components/SortableList';
import { __ } from '@erxes/ui/src/utils';
import { IProduct as IProductC } from '@erxes/ui-products/src/types';
import { LinkButton } from '@erxes/ui/src/styles/main';
import React from 'react';

import { IProductTemplateItem } from '../../types';
import StageItem from './StageItem';

type IProduct = IProductC & {};

type Props = {
  onChangeItems: (items: IProductTemplateItem[]) => void;
  items: any;
  type?: string;
  products?: IProduct[];
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
      categoryId: '',
      itemId: '',
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
    const { type } = this.props;
    const Item = StageItem;

    const child = item => (
      <Item
        item={item}
        type={type}
        onChange={this.onChange}
        remove={this.remove}
        products={this.props.products || []}
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
