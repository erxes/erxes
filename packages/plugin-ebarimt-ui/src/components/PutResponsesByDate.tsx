import { BarItems, Wrapper } from "@erxes/ui/src/layout";
import { DataWithLoader, Pagination, Table } from "@erxes/ui/src/components";

import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IPutResponse } from "../types";
import { IQueryParams } from "@erxes/ui/src/types";
import React from "react";
import RightMenu from "./RightMenu";
import { SUB_MENUS } from "../constants";
import { TableWrapper } from "../styles";
import { __ } from "@erxes/ui/src/utils";

interface IProps {
  errorMsg: string;
  putResponses: IPutResponse[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  sumAmount: number;
  bulk?: any[];
  isAllSelected?: boolean;
  queryParams: any;

  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

const PutResponsesByDate: React.FC<IProps> = (props: IProps) => {
  const {
    putResponses,
    loading,
    totalCount,
    sumAmount,
    queryParams,
    errorMsg,
    onSearch,
    onFilter,
    onSelect,
    isFiltered,
    clearFilter,
  } = props;

  const renderRow = (putResponse, index) => {
    const { date, values } = putResponse;
    return (
      <tr>
        <td>{index + 1} </td>
        <td>{date} </td>
        <td>{values.counter.toLocaleString()} </td>
        <td>{values.cityTax.toLocaleString()} </td>
        <td>{values.vat.toLocaleString()} </td>
        <td>{values.amount.toLocaleString()} </td>
      </tr>
    );
  };

  const mainContent = errorMsg ? (
    <EmptyState
      text={errorMsg.replace("GraphQL error: ", "")}
      size="full"
      image={"/images/actions/11.svg"}
    />
  ) : (
    <TableWrapper>
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th>{__("№")}</th>
            <th>{__("Date")}</th>
            <th>{__("Count")}</th>
            <th>{__("CityTax")}</th>
            <th>{__("Vat")}</th>
            <th>{__("Amount")}</th>
          </tr>
        </thead>
        <tbody id="putResponses">
          {(putResponses || []).map((putResponse, index) =>
            renderRow(putResponse, index)
          )}
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
    showMenu: !!errorMsg,
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

export default PutResponsesByDate;
