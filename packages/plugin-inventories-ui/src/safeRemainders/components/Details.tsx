import React from 'react';
import { __, Wrapper, Button, Pagination, Spinner } from '@erxes/ui/src';
import Row from './DetailsRow';
import Sidebar from './DetailsSidebar';
import { IQueryParams } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  ISafeRemainder,
  ISafeRemainderItem,
  SafeRemainderItemsQueryResponse
} from '../types';
import { TableOver } from '../../styles';

type Props = {
  queryParams: IQueryParams;
  totalCount: number;
  history: any;
  safeRemainderItemsQuery: SafeRemainderItemsQueryResponse;
  safeRemainder: ISafeRemainder;
  currentUser: IUser;
  createTransaction: (data: any) => void;
  updateRemainderItem: (_id: string, remainder: number, status: string) => void;
  removeRemainderItem: (item: ISafeRemainderItem) => void;
};

const Details = (props: Props) => {
  const {
    safeRemainder,
    queryParams,
    history,
    totalCount,
    safeRemainderItemsQuery,
    createTransaction,
    updateRemainderItem,
    removeRemainderItem
  } = props;

  const renderRow = (remainderItems: ISafeRemainderItem[]) => {
    return (remainderItems || []).map(item => (
      <Row
        key={item._id}
        item={item}
        updateItem={updateRemainderItem}
        removeItem={removeRemainderItem}
      />
    ));
  };

  const breadcrumb = [
    { title: __('Safe Remainders'), link: '/inventories/safe-remainders' },
    { title: __('Safe Remainder') }
  ];

  if (safeRemainderItemsQuery.loading) {
    return <Spinner />;
  }

  const remainderItems = safeRemainderItemsQuery.safeRemainderItems;

  const content = (
    <TableOver>
      <thead>
        <tr>
          <th rowSpan={2}>{__('Product')}</th>
          <th colSpan={3}>{__('LIVE')}</th>
          <th rowSpan={2}>{__('Checked')}</th>
          <th colSpan={2}>{__('Census')}</th>
          <th rowSpan={2}>{__('Actions')}</th>
        </tr>
        <tr>
          <th>{__('Date')}</th>
          <th>{__('Live remainder')}</th>
          <th>{__('UOM')}</th>
          <th>{__('Safe remainder')}</th>
          <th>{__('Diff')}</th>
        </tr>
      </thead>
      <tbody>{renderRow(remainderItems)}</tbody>
    </TableOver>
  );

  const actionbarRight = (
    <Button
      btnStyle="success"
      size="small"
      onClick={() => createTransaction(remainderItems)}
    >
      {__('Confirm')}
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Remainder detail')}
          breadcrumb={breadcrumb}
        />
      }
      // header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      content={content}
      actionBar={<Wrapper.ActionBar right={actionbarRight} />}
      leftSidebar={
        <Sidebar
          queryParams={queryParams}
          history={history}
          safeRemainder={safeRemainder}
        />
      }
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default Details;
