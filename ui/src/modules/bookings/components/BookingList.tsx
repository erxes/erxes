import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from 'modules/settings/constants';
import React from 'react';
import { BookingsCount, IBookingDocument } from '../types';
import Sidebar from './Sidebar';
import Row from './BookingRow';
import { Link } from 'react-router-dom';
import { BarItems } from 'modules/layout/styles';
import TaggerPopover from 'modules/tags/components/TaggerPopover';

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
  totalCount: number;
  counts: BookingsCount;
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
    refetch,
    emptyBulk,
    totalCount,
    counts
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

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        Tag
      </Button>
    );

    actionBarLeft = (
      <BarItems>
        <TaggerPopover
          type="booking"
          successCallback={emptyBulk}
          targets={bulk}
          trigger={tagButton}
        />
      </BarItems>
    );
  }

  const actionBarRight = (
    <Link to="/bookings/create">
      <Button btnStyle="success" size="small" icon="plus-circle">
        Create Booking
      </Button>
    </Link>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

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
          <th>{__('Listings')}</th>
          <th>{__('Brand')}</th>
          <th>{__('Views')}</th>
          <th>{__('Status')}</th>
          <th>{__('Created by')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Tags')}</th>
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
      leftSidebar={<Sidebar counts={counts || {}} />}
      actionBar={actionBar}
      footer={<Pagination count={2} />}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={totalCount}
          emptyContent={
            <EmptyContent content={EMPTY_CONTENT_POPUPS} maxItemWidth="360px" />
          }
        />
      }
    />
  );
}

export default BookingList;
