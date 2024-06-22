import { __, DataWithLoader, Pagination, Table, Wrapper } from "@erxes/ui/src";
import dayjs from "dayjs";
import React from "react";
import { menuSyncpolaris } from "../../constants";
import SyncHistorySidebar from "./syncHistorySidebar";
import { Title } from "@erxes/ui-settings/src/styles";

interface IProps {
  syncHistoriesPolaris: any[];
  loading: boolean;
  totalCount: number;
  queryParams: any;
}
class SyncHistoryList extends React.Component<IProps> {
  render() {
    const { syncHistoriesPolaris, totalCount, loading, queryParams } =
      this.props;

    const tablehead = ["Date", "User", "Content Type", "Content", "Error"];

    const mainContent = (
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            {tablehead.map((p) => (
              <th key={p}>{p || ""}</th>
            ))}
          </tr>
        </thead>
        <tbody id="SyncHistories">
          {(syncHistoriesPolaris || []).map((item) => (
            <tr key={item._id}>
              <td>{dayjs(item.createdAt).format("lll")}</td>
              <td>{item.createdUser?.email}</td>
              <td>{item.contentType}</td>
              <td>{item.content}</td>
              <td>
                {(item.responseStr || "").includes("timedout")
                  ? item.responseStr
                  : `
                        ${item.responseData?.extra_info?.warnings || ""}
                        ${item.responseData?.message || ""}
                        ${item.error || ""}
                        `}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Sync Polariss `)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        leftSidebar={<SyncHistorySidebar queryParams={queryParams} />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__(`DATAS (${totalCount})`)}</Title>}
            // right={actionBarRight}
            background="colorWhite"
            wideSpacing={true}
          />
        }
        footer={<Pagination count={totalCount || 0} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={totalCount || 0}
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default SyncHistoryList;
