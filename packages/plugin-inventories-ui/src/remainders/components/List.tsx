import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IRemainderProduct } from '../types';
import { SUBMENU } from '../../constants';

type Props = {
  products: IRemainderProduct[];
  totalCount: number;
  loading: boolean;
  searchValue: string;
  departmentId: string;
  branchId: string;
  isAllSelected: boolean;
  bulk: any[];
  recalculate: (
    products: any[],
    departmentId: string,
    branchId: string,
    emptyBulk: () => void
  ) => void;
  handleSearch: (event: any) => void;
  emptyBulk: () => void;
  toggleBulk: () => void;
  toggleAll: (targets: IRemainderProduct[], containerId: string) => void;
};

export default function ListComponent(props: Props) {
  const {
    products,
    totalCount,
    loading,
    searchValue,
    departmentId,
    branchId,
    isAllSelected,
    bulk,
    recalculate,
    handleSearch,
    emptyBulk,
    toggleBulk,
    toggleAll
  } = props;

  const renderRow = () => {
    return products.map((product: IRemainderProduct) => (
      <Row
        key={product._id}
        product={product}
        isChecked={bulk.includes(product)}
        toggleBulk={toggleBulk}
      />
    ));
  };

  let actionButtons = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={handleSearch}
        defaultValue={searchValue}
        autoFocus={true}
      />
      <Button
        btnStyle="primary"
        icon="calcualtor"
        disabled={!(branchId && departmentId && bulk.length)}
        onClick={() => recalculate(bulk, departmentId, branchId, emptyBulk)}
      >
        {__('Recalculate')}
      </Button>
    </BarItems>
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th style={{ width: 60 }}>
            <FormControl
              checked={isAllSelected}
              componentClass="checkbox"
              onChange={() => toggleAll(products, 'products')}
            />
          </th>
          <th>{__('Code')}</th>
          <th>{__('Name')}</th>
          <th>{__('Category')}</th>
          <th>{__('Unit Price')}</th>
          <th>{__('Remainder')}</th>
          <th>{__('Soon In')}</th>
          <th>{__('Soon Out')}</th>
          <th>{__('UOM')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Remainder of Products')} submenu={SUBMENU} />
      }
      actionBar={<Wrapper.ActionBar right={actionButtons} />}
      leftSidebar={<Sidebar />}
      footer={<Pagination count={totalCount} />}
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
    />
  );
}
