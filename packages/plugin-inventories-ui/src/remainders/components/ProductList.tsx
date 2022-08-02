import React from 'react';
import Row from './ProductRow';
import {
  BarItems,
  Button,
  DataWithLoader,
  EmptyState,
  FormControl,
  Pagination,
  Table,
  Wrapper
} from '@erxes/ui/src';
import { IRemainderProduct } from '../types';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import { SUBMENU } from '../../constants';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  products: IRemainderProduct[];
  totalCount: number;
  loading: boolean;
  searchValue: string;
  currentCategory: IProductCategory;
  departmentId: string;
  branchId: string;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  recalc: (
    doc: { productIds: string[]; departmentId: string; branchId: string },
    emptyBulk: () => void
  ) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IRemainderProduct[], containerId: string) => void;
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.queryParams.searchValue
    };
  }

  renderRow = () => {
    const { products, history, bulk, toggleBulk } = this.props;

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

  moveCursorAtTheEnd(event: any) {
    const tempValue = event.target.value;

    event.target.value = '';
    event.target.value = tempValue;
  }

  handleChange = () => {
    const { toggleAll, products } = this.props;
    toggleAll(products, 'products');
  };

  recalcRemainders = (
    products: any,
    departmentId: string,
    branchId: string
  ) => {
    const productIds: string[] = [];

    products.forEach((product: any) => {
      productIds.push(product._id);
    });

    console.log(departmentId, branchId);

    this.props.recalc(
      { productIds, departmentId, branchId },
      this.props.emptyBulk
    );
  };

  render() {
    const {
      loading,
      queryParams,
      history,
      totalCount,
      isAllSelected,
      bulk,
      departmentId,
      branchId
    } = this.props;

    let actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          defaultValue={queryParams.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
      </BarItems>
    );

    let content = (
      <>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.handleChange}
                />
              </th>
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
              <th>{__('Category')}</th>
              <th>{__('Unit Price')}</th>
              <th>{__('Remainder')}</th>
              <th>{__('UOM')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (totalCount === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.recalcRemainders(bulk, departmentId, branchId);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarRight = (
        <BarItems>
          <Button
            btnStyle="simple"
            size="small"
            icon="tag-alt"
            onClick={onClick}
          >
            ReCalc remainder
          </Button>
        </BarItems>
      );
    }

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Remainder of Products')}
            submenu={SUBMENU}
          />
        }
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
      />
    );
  }
}

export default List;
