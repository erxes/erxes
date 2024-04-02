import {
  DataWithLoader,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from "@erxes/ui/src";
import { IQueryParams } from "@erxes/ui/src/types";

import CoverSidebar from "./CoverSidebar";
import { ICover } from "../types";
import React from "react";
import Row from "./CoverRow";
import { TableWrapper } from "../../styles";
import { Title } from "@erxes/ui-settings/src/styles";
import { menuPos } from "../../constants";

type Props = {
  covers: ICover[];
  bulk: any[];
  isAllSelected: boolean;
  queryParams: any;
  coversCount: number;
  loading: boolean;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  remove: (_id: string) => void;
};

const CoverList = (props: Props) => {
  const { covers, queryParams, remove, coversCount, loading } = props;

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderActionBar = () => {
    return <Wrapper.ActionBar left={<Title>{__("Pos Covers")}</Title>} />;
  };

  const renderContent = () => {
    return (
      <TableWrapper>
        <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
          <thead>
            <tr>
              <th>
                <SortHandler sortField={"beginDate"} label={__("Begin Date")} />
              </th>
              <th>
                <SortHandler sortField={"endDate"} label={__("End Date")} />
              </th>
              <th>
                <SortHandler sortField={"posToken"} label={__("POS")} />
              </th>
              <th>
                <SortHandler sortField={"user"} label={__("User")} />
              </th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody id="covers">
            {(covers || []).map((cover) => (
              <Row cover={cover} key={cover._id} remove={remove} />
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={__(`Pos Covers`)} submenu={menuPos} />}
      actionBar={renderActionBar()}
      leftSidebar={<CoverSidebar queryParams={queryParams} />}
      footer={<Pagination count={coversCount} />}
      hasBorder={true}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={coversCount}
          emptyText="Add in your first cover!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default CoverList;
