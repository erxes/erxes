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
  ISafeRemaItem,
  SafeRemItemsQueryResponse
} from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { TableOver } from '../../styles';

type Props = {
  queryParams: IQueryParams;
  totalCount: number;
  history: any;
  safeRemItemsQuery: SafeRemItemsQueryResponse;
  safeRemainder: ISafeRemainder;
  currentUser: IUser;
};

class CompanyDetails extends React.Component<Props> {
  renderRow = (remItems: ISafeRemaItem[]) => {
    return (remItems || []).map(rem => <Row key={rem._id} item={rem} />);
  };

  render() {
    const {
      safeRemainder,
      queryParams,
      history,
      totalCount,
      safeRemItemsQuery
    } = this.props;
    const breadcrumb = [
      { title: __('Safe Remainders'), link: '/inventories/safe-remainders' },
      { title: 'Safe Remainder' }
    ];

    if (safeRemItemsQuery.loading) {
      return <Spinner />;
    }

    const remItems = safeRemItemsQuery.safeRemItems;

    const content = (
      <>
        <TableOver hover={true}>
          <thead>
            <tr>
              <th>{__('Product')}</th>
              <th>{__('Live remainder')}</th>
              <th>{__('UOM')}</th>
              <th>{__('Product Category')}</th>
              <th>{__('Description')}</th>
              <th>{__('Status')}</th>
              <th>{__('ModifiedAt')}</th>
              <th>{__('ModifiedBy')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow(remItems)}</tbody>
        </TableOver>
      </>
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

export default CompanyDetails;
