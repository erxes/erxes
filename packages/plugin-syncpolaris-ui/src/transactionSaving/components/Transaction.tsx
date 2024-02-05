import React from 'react';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, Wrapper, DataWithLoader, Pagination, Table } from '@erxes/ui/src';

import Sidebar from '../../search/Sidebar';
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

class TransactionAcnt extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { history, syncHistories, totalCount, loading, queryParams } =
      this.props;

    const tablehead = [
      'Date',
      'Number',
      'Transaction Type',
      'Content',
      'Error',
    ];

    const mainContent = (
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            {tablehead.map((p) => (
              <th key={p}>{p || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody id="orders">
          {(syncHistories || []).map((transactionSaving) => (
            <tr key={transactionSaving._id}>
              <td>{dayjs(transactionSaving.createdAt).format('lll')}</td>
              <td>{transactionSaving.consumeData?.object?.number}</td>
              <td>{transactionSaving.consumeData?.object?.transactionType}</td>
              <td>{transactionSaving.content}</td>
              <td>
                {(transactionSaving.responseStr || '').includes('timedout')
                  ? transactionSaving.responseStr
                  : '' ||
                    `
                        ${
                          transactionSaving.responseData?.extra_info
                            ?.warnings || ''
                        }
                        ${transactionSaving.responseData?.message || ''}
                        ${transactionSaving.error || ''}
                        ${
                          typeof (
                            transactionSaving.responseData?.error || ''
                          ) === 'string'
                        }
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
            title={__(`transaction`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`transactions (${totalCount})`)}</Title>}
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

export default TransactionAcnt;
