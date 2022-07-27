import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { EMPTY_CONTENT_BOOKINGS } from '../constants';
import React from 'react';
import { IBookingIntegration } from '../types';
import Sidebar from './Sidebar';
import Row from './BookingRow';
import { Link } from 'react-router-dom';
import { BarItems } from '@erxes/ui/src/layout/styles';
import TaggerPopover from '@erxes/ui/src/tags/components/TaggerPopover';
import { IntegrationsCount } from '@erxes/ui-leads/src/types';
import { TAG_TYPES } from '@erxes/ui/src/tags/constants';
import { isEnabled } from '@erxes/ui/src/utils/core';

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
        {isEnabled('tags') && (
          <TaggerPopover
            type={TAG_TYPES.INTEGRATION}
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />
        )}
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
      leftSidebar={<Sidebar counts={counts || ({} as any)} />}
      actionBar={actionBar}
      footer={<Pagination count={2} />}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={totalCount}
          emptyContent={
            <EmptyContent
              content={EMPTY_CONTENT_BOOKINGS}
              maxItemWidth="360px"
            />
          }
        />
      }
    />
  );
}

export default BookingList;
