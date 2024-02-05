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

class TransactionLoanAcnt extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }
  render() {
    const { history, syncHistories, totalCount, loading, queryParams } =
      this.props;

    const tablehead = [
      'Date',
      'number',
      'Transaction Type',
      'Content',
      'error',
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
        <tbody id="transactionLoans">
          {(syncHistories || []).map((transactionLoan) => (
            <tr key={transactionLoan._id}>
              <td>{dayjs(transactionLoan.createdAt).format('lll')}</td>
              <td>{transactionLoan.consumeData?.object?.number}</td>
              <td>{transactionLoan.consumeData?.object?.transactionType}</td>
              <td>{transactionLoan.content}</td>
              <td>
                {(transactionLoan.responseStr || '').includes('timedout')
                  ? transactionLoan.responseStr
                  : '' ||
                    `
                    ${transactionLoan.responseData?.extra_info?.warnings || ''}
                    ${transactionLoan.responseData?.message || ''}
                    ${transactionLoan.error || ''}
                    ${
                      typeof (transactionLoan.responseData?.error || '') ===
                      'string'
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
            title={__(`Loan Transaction`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(` Loan Transactions (${totalCount})`)}</Title>}
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

export default TransactionLoanAcnt;
