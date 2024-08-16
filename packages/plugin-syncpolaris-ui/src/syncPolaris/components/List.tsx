import React from "react";
import {
  __,
  Wrapper,
  DataWithLoader,
  Pagination,
  Table,
  Button,
  ModalTrigger,
  Bulk
} from "@erxes/ui/src";
import Sidebar from "../../syncPolarisHistories/components/syncHistorySidebar";
import { menuSyncpolaris } from "../../constants";
import { Title } from "@erxes/ui-settings/src/styles";
import dayjs from "dayjs";
import Form from "./Form";
interface IProps {
  toSyncPolaris: (type: string, items: any[]) => void;
  syncHistoriesPolaris: any[];
  loading: boolean;
  totalCount: number;
  queryParams: any;
  toCheckPolaris: (type: string) => void;
  items: any;
  contentType;
}

class List extends React.Component<IProps> {
  render() {
    const {
      syncHistoriesPolaris,
      totalCount,
      loading,
      queryParams,
      items,
      toSyncPolaris,
      toCheckPolaris,
      contentType
    } = this.props;
    const formHead: any[] = [];
    const tablehead = ["Date", "code", "Action", "content", "error"];
    contentType === "core:customer"
      ? formHead.push("Code", "Last name", "Firs Name", "Phones")
      : formHead.push("Number", "Status", "Start Date", "End Date");
    const onClickCheck = () => {
      toCheckPolaris(contentType);
    };
    let checkButton: React.ReactNode;
    if (
      contentType === "core:customer" ||
      contentType === "savings:contract" ||
      contentType === "loans:contract"
    ) {
      checkButton = (
        <Button
          btnStyle="warning"
          icon="check-circle"
          onMouseDown={onClickCheck}
        >
          Check
        </Button>
      );
    }

    const mainContent = (
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            {tablehead.map(head => (
              <th key={head}>{head || ""}</th>
            ))}
          </tr>
        </thead>
        <tbody id="syncPolaris">
          {(syncHistoriesPolaris || []).map(syncHistory => (
            <tr key={syncHistory._id}>
              <td>{dayjs(syncHistory.createdAt).format("lll")}</td>
              <td>
                {syncHistory.consumeData?.object?.code ||
                  syncHistory.consumeData?.object?.number}
              </td>
              <td>{syncHistory.consumeData?.action}</td>
              <td>{syncHistory.content}</td>
              <td>
                {(syncHistory.responseStr || "").includes("timedout")
                  ? syncHistory.responseStr
                  : `
                        ${syncHistory.responseData?.extra_info?.warnings || ""}
                        ${syncHistory.responseData?.message || ""}
                        ${syncHistory.error || ""}
                        `}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    const checkForm = () => {
      const content = props => {
        return (
          <Form
            items={items}
            toCheckPolaris={toCheckPolaris}
            toSyncPolaris={toSyncPolaris}
            type={contentType}
            tablehead={formHead}
            {...props}
          />
        );
      };
      return <Bulk content={content} />;
    };
    const actionBarRight = (
      <ModalTrigger
        title={`${__(contentType)}`}
        trigger={checkButton}
        autoOpenKey="showCustomerModal"
        size="xl"
        content={checkForm}
        backDrop="static"
      />
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={<Title>{__(`${contentType} (${totalCount})`)}</Title>}
        right={actionBarRight}
        background="colorWhite"
        wideSpacing={true}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Customer`)}
            queryParams={queryParams}
            submenu={menuSyncpolaris}
          />
        }
        actionBar={actionBar}
        leftSidebar={<Sidebar queryParams={queryParams} />}
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
export default List;
