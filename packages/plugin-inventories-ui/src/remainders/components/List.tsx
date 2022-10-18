import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { BarItems } from '@erxes/ui/src/layout/styles';

import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
// local
import Row from './Row';
import Sidebar from './Sidebar';
import { SUBMENU } from '../../constants';
// types
import { IRemainderProduct } from '../types';

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
  handleFilter: (key: string, value: any) => void;
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
    handleFilter,
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
      <SelectBranches
        label="Choose branch"
        name="selectedBranchIds"
        initialValue={branchId}
        onSelect={(branchId: any) => handleFilter('branchId', branchId)}
        multi={false}
        customOption={{ value: '', label: 'All branches' }}
      />
      <SelectDepartments
        label="Choose department"
        name="selectedDepartmentIds"
        initialValue={departmentId}
        onSelect={(departmentId: any) =>
          handleFilter('departmentId', departmentId)
        }
        multi={false}
        customOption={{ value: '', label: 'All departments' }}
      />
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={handleSearch}
        defaultValue={searchValue}
        autoFocus={true}
      />
      <Button
        btnStyle="primary"
        size="small"
        icon="calcualtor"
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
