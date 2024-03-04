import React from 'react';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  __,
  Wrapper,
  DataWithLoader,
  Pagination,
  Table,
  Button,
  ModalTrigger,
  Bulk,
} from '@erxes/ui/src';
import Sidebar from './Sidebar';
import { menuSyncpolaris } from '../../constants';
import { Title } from '@erxes/ui-settings/src/styles';
import dayjs from 'dayjs';
import CustomerCheckForm from './CustomerCheckForm';
interface IProps extends IRouterProps {
  toSyncCustomers: (action: string, customers: any[]) => void;
  syncHistories: any[];
  loading: boolean;
  totalCount: number;
  history: any;
  queryParams: any;
  toCheckCustomers: () => void;
  items: any;
}

class Customer extends React.Component<IProps> {
  render() {
    const {
      history,
      syncHistories,
      totalCount,
      loading,
      queryParams,
      items,
      toSyncCustomers,
      toCheckCustomers,
    } = this.props;
    const tablehead = ['Date', 'Email', 'content', 'error'];

    const onClickCheck = (e) => {
      toCheckCustomers();
      this.setState({ items: items });
    };

    const checkButton = (
      <Button btnStyle="warning" icon="check-circle" onMouseDown={onClickCheck}>
        Check
      </Button>
    );
    const mainContent = (
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            {tablehead.map((head) => (
              <th key={head}>{head || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody id="customers">
          {(syncHistories || []).map((customer) => (
            <tr key={customer._id}>
              <td>{dayjs(customer.createdAt).format('lll')}</td>
              <td>{customer.createdUser?.email}</td>
              <td>{customer.content}</td>
              <td>
                {(customer.responseStr || '').includes('timedout')
                  ? customer.responseStr
                  : `
                        ${customer.responseData?.extra_info?.warnings || ''}
                        ${customer.responseData?.message || ''}
                        ${customer.error || ''}
                        `}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    const customerCheckForm = () => {
      const content = (props) => {
        return (
          <CustomerCheckForm
            items={items}
            onClickCheck={onClickCheck}
            toSyncCustomers={toSyncCustomers}
            {...props}
          />
        );
      };
      return <Bulk content={content} />;
    };
    const actionBarRight = (
      <ModalTrigger
        title={`${__('Customers')}`}
        trigger={checkButton}
        autoOpenKey="showCustomerModal"
        size="xl"
        content={customerCheckForm}
        backDrop="static"
      />
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={<Title>{__(`Customers (${totalCount})`)}</Title>}
        right={actionBarRight}
        background="colorWhite"
        wideSpacing={true}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Customer`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        actionBar={actionBar}
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        footer={<Pagination count={totalCount || 0} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={totalCount || 0}
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}
export default Customer;
