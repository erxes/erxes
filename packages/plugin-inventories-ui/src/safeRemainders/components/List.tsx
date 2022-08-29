import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { BarItems } from '@erxes/ui/src/layout/styles';
// local
import Row from './Row';
import Sidebar from './Sidebar';
import Form from '../containers/Form';
import { SUBMENU } from '../../constants';
import { ISafeRemainder } from '../types';

type Props = {
  remainders: ISafeRemainder[];
  totalCount: number;
  loading: boolean;
  searchValue: string;
  handleSearch: (event: any) => void;
  removeItem: (remainder: ISafeRemainder) => void;
};

export default function ListComponent(props: Props) {
  const {
    remainders = [],
    totalCount = 0,
    loading = false,
    searchValue,
    handleSearch,
    removeItem
  } = props;

  const renderRow = () => {
    return remainders.map((item: ISafeRemainder) => (
      <Row key={item._id} remainder={item} removeItem={removeItem} />
    ));
  };

  const modalContent = (modalProps: any) => <Form {...modalProps} />;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add safe remainder
    </Button>
  );

  let actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={handleSearch}
        defaultValue={searchValue}
        autoFocus={true}
      />
      <ModalTrigger
        title="Add Product/Services"
        trigger={trigger}
        autoOpenKey="showAddSafeRemainderModal"
        content={modalContent}
        size="lg"
      />
    </BarItems>
  );

  let content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Date')}</th>
          <th>{__('Branch')}</th>
          <th>{__('Department')}</th>
          <th>{__('Product Category')}</th>
          <th>{__('Description')}</th>
          <th>{__('Status')}</th>
          <th>{__('ModifiedAt')}</th>
          <th>{__('ModifiedBy')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Safe Remainders')} submenu={SUBMENU} />
      }
      actionBar={<Wrapper.ActionBar right={actionBarRight} />}
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
              text="No safe remainders"
              size=""
            />
          }
        />
      }
    />
  );
}
