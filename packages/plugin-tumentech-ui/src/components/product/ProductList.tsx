import { router } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { BarItems } from '@erxes/ui/src/layout/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { __ } from '@erxes/ui/src/utils/core';
import { Count, Title } from '@erxes/ui/src/styles/main';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import React from 'react';

import CategoryList from '../../containers/productCategory/CategoryList';
import {
  ICarCategory,
  IProduct,
  IProductCategory,
  IRouterProps
} from '../../types';
import { tumentechMenu } from '../list/CarsList';
import Row from './ProductRow';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  products: IProduct[];
  product: IProduct;
  productsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { productIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IProduct[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  currentCategory: IProductCategory;
  car?: ICarCategory;
  carCategories: ICarCategory[];
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRow = () => {
    const { products, history, toggleBulk, bulk, carCategories } = this.props;

    return products.map(product => (
      <Row
        history={history}
        key={product._id}
        product={product}
        toggleBulk={toggleBulk}
        carCategories={carCategories}
        isChecked={bulk.includes(product)}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, products } = this.props;
    toggleAll(products, 'products');
  };

  removeProducts = products => {
    const productIds: string[] = [];

    products.forEach(product => {
      productIds.push(product._id);
    });

    this.props.remove({ productIds }, this.props.emptyBulk);
  };

  renderCount = productCount => {
    return (
      <Count>
        {productCount} product{productCount > 1 && 's'}
      </Count>
    );
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const {
      productsCount,
      loading,
      queryParams,
      isAllSelected,
      currentCategory,
      history,
      product,
      carCategories
    } = this.props;

    const { searchValue } = this.state;

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
      </BarItems>
    );

    let content = (
      <>
        {this.renderCount(currentCategory.productCount || productsCount)}
        <Table hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
              <th>{__('Type')}</th>
              <th>{__('Category')}</th>
              <th>{__('Supply')}</th>
              <th>{__('Product count')}</th>
              <th>{__('Minimium count')}</th>
              <th>{__('Unit Price')}</th>
              <th>{__('SKU')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (currentCategory.productCount === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    const actionBarLeft = (
      <Title>{currentCategory.name || 'All products'}</Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Product')} submenu={tumentechMenu} />
        }
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
        }
        footer={<Pagination count={productsCount} />}
        leftSidebar={
          <CategoryList
            queryParams={queryParams}
            history={history}
            product={product}
            carCategories={carCategories}
            productCategory={currentCategory}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={productsCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        hasBorder
      />
    );
  }
}

export default List;
