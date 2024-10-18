import React from 'react';
import {
  DataWithLoader,
  EmptyState,
  Pagination,
  Table,
  Wrapper,
  __,
} from '@erxes/ui/src';
import { OrdersByCustomer } from '../types';
import { menuPos } from '../../constants';
import Row from './OrdersByCustomerRow';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  list: OrdersByCustomer[];
  totalCount: number;
  loading: boolean;
};

const OrdersByCustomers = ({ list, loading, totalCount }: Props) => {
  const renderRow = () => {
    return list.map((item) => <Row item={item} />);
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
          {' '}
          <thead>
            <tr>
              <th>{__('Type')}</th>
              <th>{__('Customer Name')}</th>
              <th>{__('Customer Email')}</th>
              <th>{__('Orders Count')}</th>
              <th>{__('Total Amount')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </>
    );
  };

  const actionBar = () => {
    const actionBarLeft = <Title>{__('Pos Customers')}</Title>;

    return <Wrapper.ActionBar left={actionBarLeft} />;
  };

  return (
    <Wrapper
      hasBorder={true}
      header={<Wrapper.Header title={__('Pos Customers')} submenu={menuPos} />}
      actionBar={actionBar()}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          emptyText={__("There is no data")}
          emptyImage="/images/actions/5.svg"
        />
      }
    />
  );
};

export default OrdersByCustomers;
