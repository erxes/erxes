import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
// local
import Row from './Row';
import Sidebar from './Sidebar';
import { TableOver } from '../../styles';

type Props = {
  loading: boolean;
  totalCount: number;
  safeRemainder: any;
  safeRemainderItems: any[];
  submitSafeRemainder: (_id: string) => void;
  updateItem: (_id: string, remainder: number, status: string) => void;
  removeItem: (item: any) => void;
};

export default function List(props: Props) {
  const {
    totalCount,
    loading,
    safeRemainder,
    safeRemainderItems,
    submitSafeRemainder,
    updateItem,
    removeItem
  } = props;

  const breadcrumb = [
    { title: __('Safe Remainders'), link: '/inventories/safe-remainders' },
    { title: __('Safe Remainder') }
  ];

  const focusNext = (index: number, length: number, val?: number) => {
    let next = index + (val || 1);
    if (next >= length) {
      next = 0;
    }
    if (next < 0) {
      next = length - 1;
    }

    document
      .getElementsByClassName('canFocus')
      [next].getElementsByTagName('input')[0]
      .focus();
  };

  const renderRow = (remainderItems: any[]) => {
    return (remainderItems || []).map((item, ind) => (
      <Row
        key={item._id}
        item={item}
        updateItem={updateItem}
        removeItem={removeItem}
        onEnter={val => focusNext(ind, remainderItems.length, val)}
      />
    ));
  };

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
      <tbody>{renderRow(safeRemainderItems)}</tbody>
    </TableOver>
  );

  const actionbarRight = (
    <Button
      btnStyle="success"
      icon="check-circle"
      size="small"
      onClick={() => submitSafeRemainder(safeRemainder._id)}
    >
      {__('Submit')}
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
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={totalCount}
          emptyContent={
            <EmptyState
              image="/images/actions/5.svg"
              text="No live remainders"
              size=""
            />
          }
        />
      }
      actionBar={<Wrapper.ActionBar right={actionbarRight} />}
      leftSidebar={<Sidebar safeRemainder={safeRemainder} />}
      footer={<Pagination count={totalCount} />}
      transparent={true}
    />
  );
}
