import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import SortHandler from 'modules/common/components/SortHandler';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from 'modules/settings/constants';
import React from 'react';
import { IBookingDocument } from '../types';
import Sidebar from './Sidebar';
import Row from './BookingRow';
import BookingForm from './BookingForm';
import { NotWrappable } from 'modules/settings/permissions/styles';
import ModalTrigger from 'modules/common/components/ModalTrigger';

type Props = {
  queryParams: any;
  isAllSelected: boolean;
  bulk: IBookingDocument[];
  emptyBulk: () => void;
  loading: boolean;
  refetch: () => void;
  toggleBulk: (target: IBookingDocument, toAdd: boolean) => void;
  toggleAll: (bulk: IBookingDocument[], name: string) => void;
  history: any;
  bookings: IBookingDocument[];
  remove: (bookingId: string) => void;
};

function BookingList(props: Props) {
  const {
    isAllSelected,
    bookings,
    bulk,
    toggleBulk,
    toggleAll,
    queryParams,
    remove,
    refetch
  } = props;

  const onChange = () => {
    toggleAll(bookings, 'bookings');
  };

  const renderRow = () => {
    return bookings.map(booking => (
      <Row
        key={booking._id}
        booking={booking}
        isChecked={bulk.includes(booking)}
        toggleBulk={toggleBulk}
        remove={remove}
        refetch={refetch}
      />
    ));
  };

  const renderForm = formProps => {
    return <BookingForm {...formProps} refetch={refetch} />;
  };

  function renderActionBar() {
    const trigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        {__('Create Bookings')}
      </Button>
    );

    const actionBarRight = (
      <NotWrappable>
        <ModalTrigger
          title="Create bookings"
          trigger={trigger}
          content={renderForm}
        />
      </NotWrappable>
    );

    return <Wrapper.ActionBar right={actionBarRight} />;
  }

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>
            <FormControl
              componentClass="checkbox"
              checked={isAllSelected}
              onChange={onChange}
            />
          </th>
          <th>
            <SortHandler sortField={'name'} label={__('Name')} />
          </th>
          <th>{__('Size')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Bookings')}
          breadcrumb={[{ title: __('Bookings') }]}
          queryParams={queryParams}
        />
      }
      leftSidebar={<Sidebar />}
      actionBar={renderActionBar()}
      footer={<Pagination count={2} />}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={2}
          emptyContent={
            <EmptyContent content={EMPTY_CONTENT_POPUPS} maxItemWidth="360px" />
          }
        />
      }
    />
  );
}

export default BookingList;
