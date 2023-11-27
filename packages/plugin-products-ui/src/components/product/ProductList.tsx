import { Alert, __, confirm, router } from '@erxes/ui/src/utils';
import { Count, Title } from '@erxes/ui/src/styles/main';
import { IProduct, IProductCategory } from '../../types';

import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import CategoryList from '../../containers/productCategory/CategoryList';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Form from '@erxes/ui-products/src/containers/ProductForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { IRouterProps } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import ProductsMerge from './detail/ProductsMerge';
import ProductsPrintAction from './ProductPrintAction';
import React from 'react';
import Row from './ProductRow';
import Spinner from '@erxes/ui/src/components/Spinner';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Table from '@erxes/ui/src/components/table';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  products: IProduct[];
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
  mergeProducts: () => void;
  mergeProductLoading;
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
    const { products, history, toggleBulk, bulk } = this.props;

    return products.map(product => (
      <Row
        history={history}
        key={product._id}
        product={product}
        toggleBulk={toggleBulk}
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
    }, 1500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  renderContent = () => {
    const {
      productsCount,
      loading,
      isAllSelected,
      currentCategory
    } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    if (currentCategory.productCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    return (
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
              <th>{__('Unit Price')}</th>
              <th>{__('Tags')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );
  };

  render() {
    const {
      productsCount,
      queryParams,
      history,
      bulk,
      emptyBulk,
      currentCategory,
      mergeProducts,
      mergeProductLoading
    } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add items
      </Button>
    );

    const modalContent = props => <Form {...props} />;

    let actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        {isEnabled('segments') && (
          <TemporarySegment contentType={`products:product`} />
        )}
        <Link to="/settings/importHistories?type=product">
          <Button btnStyle="simple" icon="arrow-from-right">
            {__('Import items')}
          </Button>
        </Link>
        <ModalTrigger
          title="Add Product/Services"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
    );

    const productsMerge = props => {
      return (
        <ProductsMerge
          {...props}
          objects={bulk}
          save={mergeProducts}
          mergeProductLoading={mergeProductLoading}
        />
      );
    };

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="tag-alt">
          Tag
        </Button>
      );

      const onClick = () =>
        confirm()
          .then(() => {
            this.removeProducts(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      const mergeButton = (
        <Button btnStyle="primary" size="small" icon="merge">
          Merge
        </Button>
      );

      actionBarRight = (
        <BarItems>
          {(isEnabled('documents') && (
            <ProductsPrintAction bulk={this.props.bulk} />
          )) || <></>}

          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Product"
              size="lg"
              dialogClassName="modal-1000w"
              trigger={mergeButton}
              content={productsMerge}
            />
          )}
          {isEnabled('tags') && (
            <TaggerPopover
              type={TAG_TYPES.PRODUCT}
              successCallback={emptyBulk}
              targets={bulk}
              trigger={tagButton}
              refetchQueries={['productCountByTags']}
            />
          )}
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBarLeft = (
      <Title>{currentCategory.name || 'All products'}</Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Product & Service')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/30.svg"
            title={'Product & Service'}
            description={`${__(
              'All information and know-how related to your business products and services are found here'
            )}.${__(
              'Create and add in unlimited products and servicess so that you and your team members can edit and share'
            )}`}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
        }
        leftSidebar={
          <CategoryList queryParams={queryParams} history={history} />
        }
        footer={<Pagination count={productsCount} />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
