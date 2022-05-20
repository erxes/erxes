import React from 'react';

import { IOrderItemInput, IProduct } from '../types';
import ProductItem from './ProductItem';
import { EmptyContentWrapper, ProductsWrapper } from '../styles';
import { IConfig, IRouterProps } from '../../types';
import EmptyState from '../../common/components/EmptyState';
import { __ } from '../../common/utils';
import { POS_MODES } from '../../constants';

type Props = {
  products: IProduct[];
  setItems: (items: IOrderItemInput[]) => void;
  items: IOrderItemInput[];
  currentConfig: IConfig;
  qp: any;
  productsQuery: any;
  orientation: string;
} & IRouterProps;

type State = {
  categoriesHeight: number;
};

export default class Products extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoriesHeight: 0
    };
  }

  componentDidMount() {
    const height = document.getElementById('product-categories');

    this.setState({ categoriesHeight: height ? height.clientHeight : 0 });
  }

  addItem(item: IProduct, count: number) {
    const { items, setItems } = this.props;

    const currentItems = items.slice();
    const foundItem = currentItems.find(
      i => i.productId === item._id && !i.isTake
    );

    if (foundItem) {
      foundItem.count += count;
    } else {
      currentItems.push({
        _id: Math.random().toString(),
        productId: item._id,
        productName: item.name,
        unitPrice: item.unitPrice || 0,
        productImgUrl:
          item.attachment && item.attachment.url ? item.attachment.url : '',
        count
      });
    }

    setItems(currentItems);
  }

  renderProducts() {
    const { products = [], orientation, currentConfig, qp, items } = this.props;
    const mode = localStorage.getItem('erxesPosMode');
    const productId = qp && qp.productId ? qp.productId : '';
    let filteredProducts = products;

    if (mode === POS_MODES.KIOSK) {
      const excludeIds = currentConfig.kioskExcludeProductIds || [];
      filteredProducts = products.filter(p => !excludeIds.includes(p._id));
    }

    if (!filteredProducts || filteredProducts.length === 0) {
      return (
        <EmptyContentWrapper>
          <EmptyState
            image="/images/actions/5.svg"
            text={__('There are no products yet')}
            size={'large'}
          />
        </EmptyContentWrapper>
      );
    }

    return filteredProducts.map(product => (
      <ProductItem
        product={product}
        key={product._id}
        orientation={orientation}
        isActive={items.some(item => item.productId === product._id)}
        activeProductId={productId}
        addItem={this.addItem.bind(this, product, 1)}
      />
    ));
  }

  render() {
    const { uiOptions } = this.props.currentConfig;

    return (
      <ProductsWrapper
        height={this.state.categoriesHeight}
        color={uiOptions.colors.secondary}
        innerWidth={window.innerWidth}
        hasItems={this.props.items.length > 0}
      >
        {this.renderProducts()}
      </ProductsWrapper>
    );
  }
}
