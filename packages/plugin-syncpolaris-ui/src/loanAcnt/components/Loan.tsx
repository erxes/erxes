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

class Loan extends React.Component<IProps> {
  render() {
    const { history, syncHistories, totalCount, loading, queryParams } =
      this.props;

    const tablehead = ['Date', 'Number', 'Status', 'Content', 'Error'];

    const mainContent = (
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            {tablehead.map((p) => (
              <th key={p}>{p || ''}</th>
            ))}
          </tr>
        </thead>
        <tbody id="loans">
          {(syncHistories || []).map((loanAcnt) => (
            <tr key={loanAcnt._id}>
              <td>{dayjs(loanAcnt.createdAt).format('lll')}</td>
              <td>{loanAcnt.consumeData?.object?.number}</td>
              <td>{loanAcnt.consumeData?.object?.status}</td>
              <td>{loanAcnt.content}</td>
              <td>
                {(loanAcnt.responseStr || '').includes('timedout')
                  ? loanAcnt.responseStr
                  : `
                      ${loanAcnt.responseData?.extra_info?.warnings || ''}
                      ${loanAcnt.responseData?.message || ''}
                      ${loanAcnt.error || ''}
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
            title={__(`loan Account`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`loan accounts (${totalCount})`)}</Title>}
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

export default Loan;
