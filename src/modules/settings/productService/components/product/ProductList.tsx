import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { FormControl } from 'modules/common/components/form';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { IRouterProps } from 'modules/common/types';
import { __, Alert, confirm } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import Form from '../../containers/product/ProductForm';
import CategoryList from '../../containers/productCategory/CategoryList';
import { IProduct } from '../../types';
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

  render() {
    const {
      productsCount,
      loading,
      queryParams,
      isAllSelected,
      history,
      bulk
    } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service') }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        Add Product / Service
      </Button>
    );

    const modalContent = props => <Form {...props} />;

    let actionBarRight = (
      <BarItems>
        <Link to="/settings/importHistories?type=customer">
          <Button btnStyle="primary" size="small" icon="arrow-from-right">
            {__('Go to import')}
          </Button>
        </Link>
        <ModalTrigger
          title="Add Product / Service"
          trigger={trigger}
          content={modalContent}
        />
      </BarItems>
    );

    const content = (
      <Table bordered={true} hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            <th>{__('Name')}</th>
            <th>{__('Type')}</th>
            <th>{__('Description')}</th>
            <th>{__('CATEGORY')}</th>
            <th>{__('SKU')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    if (bulk.length > 0) {
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

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Product & Service')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <React.Fragment>
                <HeaderDescription
                  icon="/images/actions/30.svg"
                  title={'Product & Service'}
                  description={`All information and know-how related to your business's products and services are found here. Create and add in unlimited products and servicess so that you and your team members can edit and share.`}
                />
              </React.Fragment>
            }
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
