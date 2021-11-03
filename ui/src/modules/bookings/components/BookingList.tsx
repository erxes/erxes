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
import { IBookingIntegration } from '../types';
import Sidebar from './Sidebar';
import Row from './BookingRow';
import { Link } from 'react-router-dom';
import { BarItems } from 'modules/layout/styles';
import TaggerPopover from 'modules/tags/components/TaggerPopover';
import { IntegrationsCount } from 'modules/leads/types';

type Props = {
  queryParams: any;
  isAllSelected: boolean;
  bulk: IBookingIntegration[];
  emptyBulk: () => void;
  loading: boolean;
  refetch: () => void;
  toggleBulk: (target: IBookingIntegration, toAdd: boolean) => void;
  toggleAll: (bulk: IBookingIntegration[], name: string) => void;
  history: any;
  remove: (bookingId: string) => void;
  totalCount: number;
  counts: IntegrationsCount;
  archive: (_id: string, status: boolean) => IBookingIntegration;
  integrations: IBookingIntegration[];
};

function BookingList(props: Props) {
  const {
    isAllSelected,
    bulk,
    toggleBulk,
    toggleAll,
    queryParams,
    remove,
    refetch,
    emptyBulk,
    totalCount,
    counts,
    archive,
    integrations
  } = props;

  const onChange = () => {
    toggleAll(integrations, 'integrations');
  };

  const renderRow = () => {
    return integrations.map(integration => (
      <Row
        key={integration._id}
        integration={integration}
        isChecked={bulk.includes(integration)}
        toggleBulk={toggleBulk}
        remove={remove}
        refetch={refetch}
        archive={archive}
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
          type="integration"
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
