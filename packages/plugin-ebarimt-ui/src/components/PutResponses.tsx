import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import {
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
} from "@erxes/ui/src/components";

import { IPutResponse } from "../types";
import { IQueryParams } from "@erxes/ui/src/types";
import PutResponseRow from "./PutResponseRow";
import React from "react";
import RightMenu from "./RightMenu";
import { SUB_MENUS } from "../constants";
import { TableWrapper } from "../styles";
import { __ } from "@erxes/ui/src/utils";

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
  onReReturn: (_id: string) => void;
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
    clearFilter,
    onReReturn
  } = props;

  const mainContent = (
    <TableWrapper>
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
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
              <SortHandler sortField={'status'} label={__('Status')} />
            </th>
            <th>
              <SortHandler sortField={'type'} label={__('Bill Type')} />
            </th>
            <th>
              <SortHandler label={__('receipts')} />
            </th>
            <th>
              <SortHandler sortField={'totalAmount'} label={__('Amount')} />
            </th>
            <th>
              <SortHandler sortField={'message'} label={__('Message')} />
            </th>
            <th>
              <SortHandler
                sortField={"InactiveId"}
                label={__("Inactive ID")}
              />
            </th>
            <th>Үйлдлүүд</th>
          </tr>
        </thead>
        <tbody id="putResponses">
          {(putResponses || []).map((putResponse) => (
            <PutResponseRow
              putResponse={putResponse}
              key={putResponse._id}
              history={history}
              onReReturn={onReReturn}
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
    queryParams,
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
          emptyText={__("Add in your first putResponse!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default PutResponses;
