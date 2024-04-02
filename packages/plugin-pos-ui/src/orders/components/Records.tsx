import {
  BarItems,
  Button,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from "@erxes/ui/src";
import { IQueryParams } from "@erxes/ui/src/types";

import { IOrder } from "../types";
import React from "react";
import Record from "./Record";
import RightMenu from "./RightMenu";
import { TableWrapper } from "../../styles";
import { Title } from "@erxes/ui-settings/src/styles";
import { menuPos } from "../../constants";

type Props = {
  orders: IOrder[];
  count: number;
  loading: boolean;
  bulk: any[];
  isAllSelected: boolean;
  queryParams: any;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  exportRecord: (headers: any) => void;
};

const Records = (props: Props) => {
  const {
    orders,
    count,
    exportRecord,
    loading,
    queryParams,
    onFilter,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
  } = props;

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const tableHeaders = [
    { name: "created_date", title: __("created date") },
    { name: "created_time", title: __("created time") },
    { name: "number", title: __("Number") },
    { name: "pos", title: __("POS") },
    { name: "branch", title: __("Branch") },
    { name: "department", title: __("Department") },
    { name: "cashier", title: __("Cashier") },
    { name: "type", title: __("Type") },
    { name: "billType", title: __("Bill Type") },
    { name: "companyRD", title: __("Company RD") },
    { name: "customerType", title: __("Customer type") },
    { name: "customer", title: __("Customer") },
    { name: "barcode", title: __("Barcode") },
    { name: "subBarcode", title: __("Factor") },
    { name: "code", title: __("Code") },
    { name: "categoryCode", title: __("Category code") },
    { name: "categoryName", title: __("Category name") },
    { name: "name", title: __("Name") },
    { name: "count", title: __("Count") },
    { name: "firstPrice", title: __("First price") },
    { name: "discount", title: __("Discount") },
    { name: "discountType", title: __("Discount type") },
    { name: "salePrice", title: __("Sale price") },
    { name: "amount", title: __("Amount") },
    { name: "payType", title: __("Payment type") },
  ];

  const renderActionBar = () => {
    const rightMenuProps = {
      onFilter,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams,
    };

    const actionBarLeft = <Title>{__("Pos Records")}</Title>;

    const actionBarRight = (
      <BarItems>
        {count > 0 && (
          <Button
            icon="export"
            btnStyle="success"
            onClick={exportRecord.bind(tableHeaders)}
          >
            {__(`Export`)}
          </Button>
        )}

        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    return <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />;
  };

  const renderContent = () => {
    return (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              {tableHeaders.map((th) => (
                <th key={th.name}>
                  <SortHandler
                    key={th.name}
                    sortField={th.name}
                    label={th.title}
                  />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="orders">
            {(orders || []).map((order) => (
              <Record
                order={order}
                key={`${order._id}_${order.items._id}`}
                otherPayTitles={[]}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );
  };

  return (
    <Wrapper
      hasBorder={true}
      header={
        <Wrapper.Header
          title={__(`Pos Orders`)}
          queryParams={queryParams}
          submenu={menuPos}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={count} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={(orders || []).length}
          emptyText="Add in your first order!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default Records;
