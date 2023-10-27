import {
  __,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  BarItems,
  Button
} from '@erxes/ui/src';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuPos } from '../../constants';
import { Link } from 'react-router-dom';
import { TableWrapper } from '../../styles';
import { IOrder } from '../types';
import HeaderDescription from './MainHead';
import RightMenu from './RightMenu';
import Record from './Record';

interface IProps extends IRouterProps {
  orders: IOrder[];
  count: number;
  loading: boolean;
  bulk: any[];
  isAllSelected: boolean;
  history: any;
  queryParams: any;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  exportRecord: (headers: any) => void;
}

class Orders extends React.Component<IProps, {}> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);
  }

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  tableHeaders = [
    { name: 'created_date', title: __('created date') },
    { name: 'created_time', title: __('created time') },
    { name: 'number', title: __('Number') },
    { name: 'pos', title: __('POS') },
    { name: 'branch', title: __('Branch') },
    { name: 'department', title: __('Department') },
    { name: 'cashier', title: __('Cashier') },
    { name: 'type', title: __('Type') },
    { name: 'billType', title: __('Bill Type') },
    { name: 'companyRD', title: __('Company RD') },
    { name: 'customerType', title: __('Customer type') },
    { name: 'customer', title: __('Customer') },
    { name: 'barcode', title: __('Barcode') },
    { name: 'subBarcode', title: __('Factor') },
    { name: 'code', title: __('Code') },
    { name: 'categoryCode', title: __('Category code') },
    { name: 'categoryName', title: __('Category name') },
    { name: 'name', title: __('Name') },
    { name: 'count', title: __('Count') },
    { name: 'firstPrice', title: __('First price') },
    { name: 'discount', title: __('Discount') },
    { name: 'discountType', title: __('Discount type') },
    { name: 'salePrice', title: __('Sale price') },
    { name: 'amount', title: __('Amount') },
    { name: 'payType', title: __('Payment type') }
  ];

  render() {
    const {
      orders,
      count,
      exportRecord,
      history,
      loading,
      queryParams,
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter
    } = this.props;

    const rightMenuProps = {
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams
    };

    const actionBarRight = (
      <BarItems>
        {this.props.count > 0 && (
          <Button
            icon="export"
            btnStyle="success"
            onClick={exportRecord.bind(this.tableHeaders)}
          >
            {__(`Export`)}
          </Button>
        )}

        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const header = (
      <HeaderDescription
        icon="/images/actions/26.svg"
        title=""
        summary={{}}
        staticKeys={[]}
        actionBar={actionBarRight}
      />
    );

    const mainContent = (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              {this.tableHeaders.map(th => (
                <th>
                  <SortHandler
                    key={th.name}
                    sortField={th.name}
                    label={th.title}
                  />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="orders">
            {(orders || []).map(order => (
              <Record
                order={order}
                key={`${order._id}_${order.items._id}`}
                history={history}
                otherPayTitles={[]}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Pos Orders`)}
            queryParams={queryParams}
            submenu={menuPos}
          />
        }
        mainHead={header}
        footer={<Pagination count={count} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={(orders || []).length}
            emptyText="Add in your first order!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(Orders);
