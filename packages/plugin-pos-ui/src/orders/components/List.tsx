import MainHead from './MainHead';
import React from 'react';
import RightMenu from './RightMenu';
import Row from './Row';
import { IOrder } from '../types';
import { IQueryParams } from '@erxes/ui/src/types';
import { menuPos } from '../../constants';
import { TableWrapper } from '../../styles';
import {
  BarItems,
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from "@erxes/ui/src";

type Props = {
  orders: IOrder[];
  loading: boolean;
  bulk: any[];
  isAllSelected: boolean;
  queryParams: any;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  summary: any;

  onReturnBill: (orderId: string) => void;
};

const List = (props: Props) => {
  const {
    orders,
    loading,
    queryParams,
    onFilter,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    summary,
    onReturnBill,
  } = props;

  const staticKeys = ["count", "totalAmount", "cashAmount", "mobileAmount"];

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderActionBar = () => {
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

    return <Wrapper.ActionBar right={actionBarRight} />;
  };

  const renderMainHead = () => {
    return (
      <MainHead
        icon="/images/actions/26.svg"
        title=""
        summary={summary || {}}
        staticKeys={staticKeys}
        actionBar={renderActionBar()}
      />
    )
  }

  const renderContent = () => {
    const otherPayTitles = (summary ? Object.keys(summary) || [] : [])
      .filter((a) => !["_id"].includes(a))
      .filter((a) => !staticKeys.includes(a))
      .sort();

    return (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={"number"} label={__("Bill number")} />
              </th>
              <th>
                <SortHandler sortField={"paidDate"} label={__("Date")} />
              </th>
              <th>
                <SortHandler
                  sortField={"cashAmount"}
                  label={__("Cash Amount")}
                />
              </th>
              <th>
                <SortHandler
                  sortField={"mobileAmount"}
                  label={__("Mobile Amount")}
                />
              </th>
              {otherPayTitles.map((key) => (
                <th key={Math.random()}>{__(key)}</th>
              ))}
              <th>
                <SortHandler sortField={"totalAmount"} label={__("Amount")} />
              </th>
              <th>
                <SortHandler sortField={"customerId"} label={__("Customer")} />
              </th>
              <th>
                <SortHandler sortField={"posName"} label={__("Pos")} />
              </th>
              <th>
                <SortHandler sortField={"type"} label={__("Type")} />
              </th>
              <th>
                <SortHandler sortField={"user"} label={__("User")} />
              </th>
              <th>Үйлдлүүд</th>
            </tr>
          </thead>
          <tbody id="orders">
            {(orders || []).map((order) => (
              <Row
                order={order}
                key={order._id}
                otherPayTitles={otherPayTitles}
                onReturnBill={onReturnBill}
              />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={__(`Pos Orders`)} submenu={menuPos} />}
      hasBorder={true}
      mainHead={renderMainHead()}
      footer={<Pagination count={(summary || {}).count || 0} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={(orders || []).length}
          emptyText={__("Add in your first order!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default List;
