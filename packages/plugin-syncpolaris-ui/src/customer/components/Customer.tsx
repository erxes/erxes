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

class Customer extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }
  render() {
    const { history, syncHistories, totalCount, loading, queryParams } =
      this.props;

    const tablehead = ['Date', 'Email', 'content', 'error'];

    const mainContent = (
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            {tablehead.map((p) => (
              <th key={p}>{p || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody id="customers">
          {(syncHistories || []).map((item) => (
            <tr key={item._id}>
              <td>{dayjs(item.createdAt).format('lll')}</td>
              <td>{item.createdUser?.email}</td>
              <td>{item.content}</td>
              <td>
                {(item.responseStr || '').includes('timedout')
                  ? item.responseStr
                  : '' ||
                    `
                    ${item.responseData?.extra_info?.warnings || ''}
                    ${item.responseData?.message || ''}
                    ${item.error || ''}
                    ${typeof (item.responseData?.error || '') === 'string'}
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
