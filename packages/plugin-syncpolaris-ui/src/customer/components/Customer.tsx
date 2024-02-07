import React from 'react';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, Wrapper, DataWithLoader, Pagination, Table } from '@erxes/ui/src';

import Sidebar from './Sidebar';
import { menuSyncpolaris } from '../../constants';
import { Title } from '@erxes/ui-settings/src/styles';
import dayjs from 'dayjs';

interface IProps extends IRouterProps {
  syncHistories: any[];
  loading: boolean;
  totalCount: number;
  history: any;
  queryParams: any;
}

class Customer extends React.Component<IProps> {
  render() {
    const { history, syncHistories, totalCount, loading, queryParams } =
      this.props;

    const tablehead = ['Date', 'Email', 'content', 'error'];

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

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Customer`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Customers (${totalCount})`)}</Title>}
            // right={actionBarRight}
            background="colorWhite"
            wideSpacing={true}
          />
        }
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
