import { Title } from '@erxes/ui-settings/src/styles';
import {
  Button,
  DataWithLoader,
  EmptyState,
  Pagination,
  SelectTeamMembers,
  Table,
  Wrapper,
  __
} from '@erxes/ui/src';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { router } from '@erxes/ui/src/utils/core';
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { menuPos } from '../../constants';
import { RightMenuContainer, RightMenuWrapper } from '../../styles';
import { PosOrdersBySub } from '../types';
import Row from './OrdersBySubRow';

const SelectCustomers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
    )
);

const SelectCompanies = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

type Props = {
  list: PosOrdersBySub[];
  totalCount: number;
  loading: boolean;
  queryParams: any;
};

const checkIsFiltered = (queryParams: any) => {
  return !!(
    queryParams?.customerId ||
    queryParams?.companyId ||
    queryParams?.userId
  );
};

const OrdersBySubs = ({ list, loading, totalCount, queryParams }: Props) => {
  const wrapperRef = useRef(null);

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isFiltered = checkIsFiltered(queryParams);

  const FilterMenu = () => {
    const handleSelect = (value, key) => {
      router.setParams(navigate, location, {
        [key]: value ? value : undefined
      });
    };

    const clearFilter = () => {
      router.setParams(navigate, location, {
        customerId: undefined,
        companyId: undefined,
        userId: undefined
      });
    };

    return (
      <div ref={wrapperRef}>
        {isFiltered && (
          <Button
            btnStyle="warning"
            icon="times-circle"
            uppercase={false}
            onClick={clearFilter}
          >
            {__('Clear Filter')}
          </Button>
        )}
        <Button
          btnStyle="simple"
          uppercase={false}
          icon="bars"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? __('Hide Filter') : __('Show Filter')}
        </Button>

        <CSSTransition
          in={showMenu}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightMenuContainer>
            <RightMenuWrapper>
              <SelectCustomers
                label={__('Filter by customer')}
                name="customerId"
                initialValue={queryParams.customerId}
                onSelect={handleSelect}
                customOption={{
                  value: '',
                  label: '...Clear customer filter'
                }}
                multi={false}
              />
              <SelectCompanies
                label={__('Filter by company')}
                name="companyId"
                initialValue={queryParams.companyId}
                onSelect={handleSelect}
                customOption={{
                  value: '',
                  label: '...Clear company filter'
                }}
                multi={false}
              />

              <SelectTeamMembers
                label={__('Choose users')}
                name="userId"
                initialValue={queryParams.userId}
                onSelect={handleSelect}
                customOption={{ value: '', label: '...Clear user filter' }}
                multi={false}
              />
            </RightMenuWrapper>
          </RightMenuContainer>
        </CSSTransition>
      </div>
    );
  };

  const renderRows = () => {
    return list.map(item => <Row key={item._id} item={item} />);
  };

  const renderContent = () => {
    if (totalCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Customers"
          size="small"
        />
      );
    }

    return (
      <>
        <Table $hover={true}>
          <thead>
            <tr>
              <th>{__('Type')}</th>
              <th>{__('Customer Name')}</th>
              <th>{__('Customer Email')}</th>
              <th>{__('Status')}</th>
              <th>{__('Close Date')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </Table>
      </>
    );
  };

  const actionBar = () => {
    const actionBarLeft = <Title>{__('Pos Subscriptions')}</Title>;

    return <Wrapper.ActionBar left={actionBarLeft} right={<FilterMenu />} />;
  };

  return (
    <Wrapper
      hasBorder={true}
      header={
        <Wrapper.Header title={__('Pos Subscriptions')} submenu={menuPos} />
      }
      actionBar={actionBar()}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
    />
  );
};

export default OrdersBySubs;
