import { Title } from '@erxes/ui-settings/src/styles';
import {
  Alert,
  BarItems,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  Table,
  Wrapper,
} from '@erxes/ui/src';
import { __, router } from '@erxes/ui/src/utils/core';
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../general/components/Sidebar';
import Form from '../containers/Form';
import { ICouponCampaign } from '../types';
import Row from './Row';

type Props = {
  couponCampaigns: ICouponCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: ICouponCampaign[], containerId: string) => void;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { couponCampaignIds: string[] }, emptyBulk: () => void) => void;
  totalCount: number;
};

const List = (props: Props) => {
  const timerRef = useRef<number | null>(null);

  const {
    queryParams,
    loading,
    totalCount = 1,
    isAllSelected,
    bulk,
    couponCampaigns,
    toggleAll,
    toggleBulk,
    emptyBulk,
    remove,
  } = props;

  const [searchValue, setSearchValue] = useState(queryParams.searchValue || '');

  const location = useLocation();
  const navigate = useNavigate();

  const modalContent = (props) => {
    return <Form {...props} />;
  };

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, 'page');
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const handleRemove = () => {
    const couponCampaignIds: string[] = [];

    confirm()
      .then(() => {
        bulk.forEach((couponCampaign) => {
          couponCampaignIds.push(couponCampaign._id);
        });

        remove({ couponCampaignIds }, emptyBulk);
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const renderActionBar = () => {
    const left = <Title $capitalize={true}>{__('Coupon Campaign')}</Title>;

    const right = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={handleSearch}
          value={searchValue}
          autoFocus={true}
        />
        <ModalTrigger
          size={'lg'}
          title={__('Add coupon campaign')}
          trigger={
            <Button btnStyle="success" icon="plus-circle">
              Add coupon campaign
            </Button>
          }
          autoOpenKey="showCouponCampaignModal"
          content={modalContent}
        />
        {bulk.length ? (
          <Button btnStyle="danger" icon="cancel-1" onClick={handleRemove}>
            Remove
          </Button>
        ) : null}
      </BarItems>
    );

    return <Wrapper.ActionBar left={left} right={right} />;
  };

  const renderContent = () => {
    return (
      <Table $hover={true}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={() => {
                  toggleAll(couponCampaigns, 'couponCampaigns');
                }}
              />
            </th>
            <th>{__('Title')}</th>
            <th>{__('Start Date')}</th>
            <th>{__('End Date')}</th>
            <th>{__('Finish Date of Use')}</th>
            <th>{__('Type')}</th>
            <th>{__('Status')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {(couponCampaigns || []).map((couponCampaign: ICouponCampaign) => (
            <Row
              key={couponCampaign._id}
              couponCampaign={couponCampaign}
              toggleBulk={toggleBulk}
              isChecked={bulk.includes(couponCampaign)}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Coupon Campaign')}
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            {
              title: __('Loyalties Config'),
              link: '/erxes-plugin-loyalty/settings/general',
            },
            { title: __('Coupon Campaign') },
          ]}
        />
      }
      actionBar={renderActionBar()}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There are no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      leftSidebar={<Sidebar />}
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={totalCount} />}
    />
  );
};

export default List;
