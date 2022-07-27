import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './DetailRow';
import Sidebar from './DetailSidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { IQueryParams } from '@erxes/ui/src/types';
import {
  ISafeRemainder,
  ISafeRemainderItem,
  SafeRemainderItemsQueryResponse
} from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { TableOver } from '../../styles';

type Props = {
  queryParams: IQueryParams;
  totalCount: number;
  history: any;
  safeRemainderItemsQuery: SafeRemainderItemsQueryResponse;
  safeRemainder: ISafeRemainder;
  currentUser: IUser;
  updateRemainderItem: (_id: string, remainder: number, status: string) => void;
  removeRemainderItem: (item: ISafeRemainderItem) => void;
};

class Details extends React.Component<Props> {
  renderRow = (remItems: ISafeRemainderItem[]) => {
    const { updateRemainderItem, removeRemainderItem } = this.props;

    return (remItems || []).map(rem => (
      <Row
        key={rem._id}
        item={rem}
        updateItem={updateRemainderItem}
        removeItem={removeRemainderItem}
      />
    ));
  };

  render() {
    const {
      safeRemainder,
      queryParams,
      history,
      totalCount,
      safeRemainderItemsQuery
    } = this.props;
    const breadcrumb = [
      { title: __('Safe Remainders'), link: '/inventories/safe-remainders' },
      { title: 'Safe Remainder' }
    ];

    if (safeRemainderItemsQuery.loading) {
      return <Spinner />;
    }

    const remainderItems = safeRemainderItemsQuery.safeRemainderItems;

    const content = (
      <TableOver>
        <thead>
          <tr>
            <th rowSpan={2}>{__('Product')}</th>

            <th colSpan={3}>{__('LIVE')}</th>
            <th rowSpan={2}>{__('Checked')}</th>
            <th colSpan={2}>{__('Census')}</th>
            <th rowSpan={2}>{__('Actions')}</th>
          </tr>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Live remainder')}</th>
            <th>{__('UOM')}</th>

            <th>{__('Safe remainder')}</th>

            <th>{__('Diff')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow(remainderItems)}</tbody>
      </TableOver>
    );
    const actionBarRight = <></>;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Remainder detail')}
            breadcrumb={breadcrumb}
          />
        }
        // header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        leftSidebar={
          <Sidebar
            queryParams={queryParams}
            history={history}
            safeRemainder={safeRemainder}
          />
        }
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default Details;
