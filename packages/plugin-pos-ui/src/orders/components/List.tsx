import {
  BarItems,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from '@erxes/ui/src';
import { IQueryParams, IRouterProps } from '@erxes/ui/src/types';

import HeaderDescription from './MainHead';
import { IOrder } from '../types';
import React from 'react';
import RightMenu from './RightMenu';
import Row from './Row';
import { TableWrapper } from '../../styles';
// import { withRouter } from 'react-router-dom';
import { menuPos } from '../../constants';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  orders: IOrder[];
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
  summary: any;

  onReturnBill: (orderId: string) => void;
} & IRouterProps;

const List = (props: Props) => {
  const {
    orders,
    history,
    loading,
    queryParams,
    onFilter,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    summary,
    onReturnBill,
  } = props;

  const staticKeys = ['count', 'totalAmount', 'cashAmount', 'mobileAmount'];

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  const renderActionBar = () => {
    const rightMenuProps = {
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams,
    };

    const actionBarLeft = <Title>{__('Pos Orders')}</Title>;

    const actionBarRight = (
      <BarItems>
        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    return <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />;
  };

  const renderContent = () => {
    const otherPayTitles = (summary ? Object.keys(summary) || [] : [])
      .filter((a) => !['_id'].includes(a))
      .filter((a) => !staticKeys.includes(a))
      .sort();

    return (
      <TableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={'number'} label={__('Bill number')} />
              </th>
              <th>
                <SortHandler sortField={'paidDate'} label={__('Date')} />
              </th>
              <th>
                <SortHandler
                  sortField={'cashAmount'}
                  label={__('Cash Amount')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'mobileAmount'}
                  label={__('Mobile Amount')}
                />
              </th>
              {otherPayTitles.map((key) => (
                <th key={Math.random()}>{__(key)}</th>
              ))}
              <th>
                <SortHandler sortField={'totalAmount'} label={__('Amount')} />
              </th>
              <th>
                <SortHandler sortField={'customerId'} label={__('Customer')} />
              </th>
              <th>
                <SortHandler sortField={'posName'} label={__('Pos')} />
              </th>
              <th>
                <SortHandler sortField={'type'} label={__('Type')} />
              </th>
              <th>
                <SortHandler sortField={'user'} label={__('User')} />
              </th>
              <th>Үйлдлүүд</th>
            </tr>
          </thead>
          <tbody id="orders">
            {(orders || []).map((order) => (
              <Row
                order={order}
                key={order._id}
                history={history}
                otherPayTitles={otherPayTitles}
                onReturnBill={onReturnBill}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={__(`Pos Orders`)} submenu={menuPos} />}
      hasBorder={true}
      actionBar={renderActionBar()}
      footer={<Pagination count={(summary || {}).count || 0} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={(orders || []).length}
          emptyText="Add in your first order!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default List;
