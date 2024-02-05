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

class SavingAcnt extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);
  }
  render() {
    const { history, syncHistories, totalCount, loading, queryParams } =
      this.props;
    const tablehead = ['Date', 'Contant number', 'Status', 'Deposit', 'Error'];

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
          {(syncHistories || []).map((saving) => (
            <tr key={saving._id}>
              <td>{dayjs(saving.createdAt).format('lll')}</td>
              <td>{saving.consumeData?.object?.number}</td>
              <td>{saving.consumeData?.object?.status}</td>
              <td>{saving.consumeData?.object?.isDeposit ? 'Deposit' : ''}</td>
              <td>
                {(saving.responseStr || '').includes('timedout')
                  ? saving.responseStr
                  : '' ||
                    `
                    ${saving.responseData?.extra_info?.warnings || ''}
                    ${saving.responseData?.message || ''}
                    ${saving.error || ''}
                    ${typeof (saving.responseData?.error || '') === 'string'}
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
            title={__(`saving account`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Saving accounts (${totalCount})`)}</Title>}
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

export default SavingAcnt;
