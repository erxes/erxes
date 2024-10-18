import {
  DataWithLoader,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
} from "@erxes/ui/src";
import { IQueryParams } from "@erxes/ui/src/types";

import React from "react";
import SyncHistorySidebar from "./syncHistorySidebar";
import { __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import { menuMultierkhet } from "../constants";

interface IProps {
  syncHistories: any[];
  loading: boolean;
  totalCount: number;
  queryParams: any;

  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
}

const SyncHistoryList = (props: IProps) => {
  let timer: undefined;
  const { syncHistories, totalCount, loading, queryParams } = props;

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const rowContent = (props, item) => {
    return <>{item.responseStr}</>;
  };

  const mainContent = (
    <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
      <thead>
        <tr>
          <th>
            <SortHandler sortField={"createdAt"} label={__("Date")} />
          </th>
          <th>
            <SortHandler sortField={"createdBy"} label={__("User")} />
          </th>
          <th>
            <SortHandler sortField={"contentType"} label={__("Content Type")} />
          </th>
          <th>
            <SortHandler sortField={"content"} label={__("Content")} />
          </th>
          <th>
            <SortHandler sortField={"error"} label={__("Error")} />
          </th>
        </tr>
      </thead>
      <tbody id="orders">
        {(syncHistories || []).map((item) => (
          <ModalTrigger
            title={__("Sync erkhet information")}
            trigger={
              <tr key={item._id}>
                <td>{dayjs(item.createdAt).format("lll")}</td>
                <td>{item.createdUser?.email}</td>
                <td>{item.contentType}</td>
                <td>{item.content}</td>
                <td>
                  {(item.responseStr || "").includes("timedout")
                    ? item.responseStr
                    : "" ||
                      `
                      ${item.responseData?.extra_info?.warnings || ""}
                      ${item.responseData?.message || ""}
                      ${item.error || ""}
                      ${(item.responseData?.error || "").replace(
                        "ЕБаримт руу илгээгдээгүй түр баримт болно.",
                        ""
                      )}
                      `}
                </td>
              </tr>
            }
            size="xl"
            content={(props) => rowContent(props, item)}
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
          submenu={menuMultierkhet}
        />
      }
      leftSidebar={<SyncHistorySidebar queryParams={queryParams} />}
      footer={<Pagination count={totalCount || 0} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={totalCount || 0}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default SyncHistoryList;
