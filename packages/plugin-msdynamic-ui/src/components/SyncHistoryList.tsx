import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Wrapper } from '@erxes/ui/src/layout';
import SideBar from './SideBar';
import {
  DataWithLoader,
  ModalTrigger,
  Pagination,
  Table
} from '@erxes/ui/src/components';
import { menuDynamic } from '../constants';
import { Title } from '@erxes/ui-settings/src/styles';
import dayjs from 'dayjs';

type Props = {
  history: any;
  queryParams: any;
  syncHistories: any[];
  totalCount: number;
  loading: boolean;
};

const SyncHistoryList = ({
  history,
  queryParams,
  syncHistories,
  totalCount,
  loading
}: Props) => {
  const tablehead = ['Date', 'User', 'Content Type', 'Content', 'Error'];

  const rowContent = (props, item) => {
    return <>{item.responseStr}</>;
  };

  const mainContent = (
    <Table whiteSpace="nowrap" bordered={true} hover={true}>
      <thead>
        <tr>
          {tablehead.map(p => (
            <th key={p}>{p || ''}</th>
          ))}
        </tr>
      </thead>
      <tbody id="orders">
        {(syncHistories || []).map(item => (
          // tslint:disable-next-line:jsx-key
          <ModalTrigger
            title="Sync erkhet information"
            trigger={
              <tr key={item._id}>
                <td>{dayjs(item.createdAt).format('lll')}</td>
                <td>{item.createdUser?.email}</td>
                <td>{item.contentType}</td>
                <td>{item.content}</td>
                <td>{item.error || ''}</td>
              </tr>
            }
            size="xl"
            content={props => rowContent(props, item)}
          />
        ))}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Sync Histories`)}
          queryParams={queryParams}
          submenu={menuDynamic}
        />
      }
      leftSidebar={
        <SideBar
          queryParams={queryParams}
          history={history}
          loading={loading}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__(`Sync Histories (${totalCount})`)}</Title>}
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
};

export default SyncHistoryList;
