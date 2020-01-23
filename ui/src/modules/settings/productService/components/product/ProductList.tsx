import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import { FormControl } from 'modules/common/components/form';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { Count, Title } from 'modules/common/styles/main';
import { IRouterProps } from 'modules/common/types';
import { __, Alert, confirm } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import TaggerPopover from 'modules/tags/components/TaggerPopover';
import React from 'react';
import { Link } from 'react-router-dom';
import Form from '../../containers/product/ProductForm';
import CategoryList from '../../containers/productCategory/CategoryList';
import { IProduct, IProductCategory } from '../../types';
import Row from './ProductRow';

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
  currentCategory: IProductCategory;
}

class List extends React.Component<IProps> {
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

  renderCount = (productCount) => {
    return <Count>{productCount} product{productCount > 1 && 's'}</Count>
  }

  render() {
    const {
      productsCount,
      loading,
      queryParams,
      isAllSelected,
      history,
      bulk,
      emptyBulk,
      currentCategory
    } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add Product / Service
      </Button>
    );

    const modalContent = props => <Form {...props} />;

    let actionBarRight = (
      <BarItems>
        <Link to="/settings/importHistories?type=product">
          <Button btnStyle="simple" uppercase={false} icon="arrow-from-right">
            {__('Go to import')}
          </Button>
        </Link>
        <ModalTrigger
          title="Add Product / Service"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
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
              <th>{__('Name')}</th>
              <th>{__('Type')}</th>
              <th>{__('Category')}</th>
              <th>{__('Unit Price')}</th>
              <th>{__('SKU')}</th>
              <th>{__('Tags')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if(currentCategory.productCount === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

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

      actionBarRight = (
        <BarItems>
          <TaggerPopover
            type="product"
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
            refetchQueries={['productCountByTags']}
          />
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

    const actionBarLeft = <Title>{currentCategory.name || 'All products'}</Title>;

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
            description={`All information and know-how related to your business's products and services are found here. Create and add in unlimited products and servicess so that you and your team members can edit and share.`}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={actionBarLeft}
            right={actionBarRight}
          />
        }
        leftSidebar={
          <CategoryList queryParams={queryParams} history={history} />
        }
        footer={<Pagination count={productsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={productsCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
      />
    );
  }
}

export default List;
