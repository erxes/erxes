import {
  DataWithLoader,
  Pagination,
  SortHandler,
  Table
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper, BarItems } from '@erxes/ui/src/layout';
import { IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

import { TableWrapper } from '../styles';
import { IPutResponse } from '../types';
import PutResponseRow from './PutResponseRow';
import RightMenu from './RightMenu';
import { SUB_MENUS } from '../constants';

type IProps = {
  putResponses: IPutResponse[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  sumAmount: number;
  bulk: any[];
  isAllSelected: boolean;
  history: any;
  queryParams: any;

  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
};

const PutResponses: React.FC<IProps> = (props: IProps) => {
  const {
    putResponses,
    history,
    loading,
    totalCount,
    sumAmount,
    queryParams,

    onSearch,
    onFilter,
    onSelect,
    isFiltered,
    clearFilter
  } = props;

  const mainContent = (
    <TableWrapper>
      <Table whiteSpace="nowrap" bordered={true} hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'billId'} label={__('BillID')} />
            </th>
            <th>
              <SortHandler sortField={'number'} label={__('Number')} />
            </th>
            <th>
              <SortHandler sortField={'date'} label={__('Date')} />
            </th>
            <th>
              <SortHandler sortField={'success'} label={__('Success')} />
            </th>
            <th>
              <SortHandler sortField={'billType'} label={__('Bill Type')} />
            </th>
            <th>
              <SortHandler sortField={'taxType'} label={__('Tax Type')} />
            </th>
            <th>
              <SortHandler sortField={'amount'} label={__('Amount')} />
            </th>
            <th>
              <SortHandler sortField={'message'} label={__('Message')} />
            </th>
            <th>
              <SortHandler
                sortField={'returnBillId'}
                label={__('Return BillID')}
              />
            </th>
            <th>Үйлдлүүд</th>
          </tr>
        </thead>
        <tbody id="putResponses">
          {(putResponses || []).map(putResponse => (
            <PutResponseRow
              putResponse={putResponse}
              key={putResponse._id}
              history={history}
            />
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );

  const rightMenuProps = {
    onFilter,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    queryParams
  };

  const actionBarRight = (
    <BarItems>
      <RightMenu {...rightMenuProps} />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      left={`Total: ${totalCount} #SumAmount: ${(
        sumAmount || 0
      ).toLocaleString()}`}
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Put Response`)}
          queryParams={queryParams}
          submenu={SUB_MENUS}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={totalCount}
          emptyText="Add in your first putResponse!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default PutResponses;
