import {
  BarItems,
  ControlLabel,
  DataWithLoader,
  FormControl,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from "@erxes/ui/src";
import { IQueryParams } from "@erxes/ui/src/types";

import React from "react";
import RightMenu from "./RightMenu";
import { TableWrapper } from "../../styles";
import { Title } from "@erxes/ui-settings/src/styles";
import { menuPos } from "../../constants";

type Props = {
  queryParams: any;
  loading: boolean;
  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  summary: any;
};

const Summary = (props: Props) => {
  const {
    queryParams,
    loading,
    onFilter,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    summary,
  } = props;

  const { amounts, columns } = summary;
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
        <ControlLabel>Group Type:</ControlLabel>
        <FormControl
          value={queryParams.groupField}
          componentclass="select"
          onChange={(e) => onFilter({ groupField: (e.target as any).value })}
        >
          <option value="">Undefined</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
        </FormControl>

        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const actionBarLeft = <Title>{__("Pos Summary")}</Title>;

    return <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />;
  };

  const renderContent = () => {
    const otherPayTitles = (columns ? Object.keys(columns) || [] : [])
      .filter((a) => !["_id"].includes(a))
      .filter((a) => !staticKeys.includes(a))
      .sort();

    return (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={""} label={__("Group")} />
              </th>
              <th>
                <SortHandler sortField={""} label={__("Count")} />
              </th>
              <th>
                <SortHandler sortField={""} label={__("Cash Amount")} />
              </th>
              <th>
                <SortHandler sortField={""} label={__("Mobile Amount")} />
              </th>
              {otherPayTitles.map((key) => (
                <th key={Math.random()}>{__(key)}</th>
              ))}
              <th>
                <SortHandler sortField={""} label={__("Amount")} />
              </th>
            </tr>
          </thead>
          <tbody id="orders">
            {(amounts || []).map((item) => (
              <tr key={Math.random()}>
                <td>{item.paidDate}</td>
                <td>{item.count}</td>
                <td>{item.cashAmount}</td>
                <td>{item.mobileAmount}</td>
                {otherPayTitles.map((key) => (
                  <td key={Math.random()}>{item[key]}</td>
                ))}
                <td>{item.totalAmount}</td>
              </tr>
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
      footer={<Pagination count={amounts.length} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={amounts.length}
          emptyText="Add in your first order!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default Summary;
