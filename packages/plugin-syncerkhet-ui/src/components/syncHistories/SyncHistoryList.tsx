import {
  __,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  ModalTrigger,
  FormControl
} from '@erxes/ui/src';
import dayjs from 'dayjs';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuSyncerkhet } from '../../constants';
import SyncHistorySidebar from './syncHistorySidebar';
import { Title } from '@erxes/ui-settings/src/styles';

interface IProps extends IRouterProps {
  syncHistories: any[];
  loading: boolean;
  totalCount: number;
  history: any;
  queryParams: any;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

class SyncHistoryList extends React.Component<IProps, {}> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);
  }

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  rowContent = (props, item) => {
    return <>{item.responseStr}</>;
  };

  render() {
    const {
      history,
      syncHistories,
      totalCount,
      loading,
      queryParams
    } = this.props;

    const tablehead = ['Date', 'User', 'Content Type', 'Content', 'Error'];

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
                  <td>
                    {(item.responseStr || '').includes('timedout')
                      ? item.responseStr
                      : '' ||
                        `
                      ${item.responseData?.extra_info?.warnings || ''}
                      ${item.responseData?.message || ''}
                      ${item.error || ''}
                      ${typeof (item.responseData?.error || '') === 'string' &&
                        typeof (item.responseData?.error || '').replace(
                          'ЕБаримт руу илгээгдээгүй түр баримт болно.',
                          ''
                        )}
                      `}
                  </td>
                </tr>
              }
              size="xl"
              content={props => this.rowContent(props, item)}
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
            submenu={menuSyncerkhet}
          />
        }
        leftSidebar={
          <SyncHistorySidebar
            queryParams={queryParams}
            history={history}
            loading={loading}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`Sync Histories (${totalCount})`)}</Title>}
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

export default withRouter<IRouterProps>(SyncHistoryList);
