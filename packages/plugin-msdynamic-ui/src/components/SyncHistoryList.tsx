import { Title } from "@erxes/ui-settings/src/styles";
import {
  DataWithLoader,
  FormGroup,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";
import { Wrapper } from "@erxes/ui/src/layout";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import React from "react";
import { menuDynamic } from "../constants";
import ChargeItem from "./ChargeItem";
import SideBar from "./SideBar";

type Props = {
  queryParams: any;
  syncHistories: any[];
  totalCount: number;
  loading: boolean;
};

const SyncHistoryList = ({
  queryParams,
  syncHistories,
  totalCount,
  loading,
}: Props) => {
  const tablehead = ["Date", "User", "Content Type", "Content", "Error"];

  const rowContent = (props, item) => {
    const { No, Sell_to_Customer_No, Sell_to_Customer_Name, error } =
      item.responseData || {};

    if (item?.contentType === 'pos:order') {
      const renderSales = () => {
        return (item?.responseSales || []).map((listItem, index: number) => {
          const jsonObject = JSON.parse(listItem);

          return <ChargeItem key={index} item={jsonObject} />;
        });
      };

      return (
        <>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                {__("Number")}: {item.consumeData?.number || ""}
              </FormGroup>
              <FormGroup>
                {__("Created Date")}: {dayjs(item.consumeData?.createdAt).format("lll") || ""}
              </FormGroup>
              <FormGroup>
                {__("Paid Date")}: {dayjs(item?.consumeData?.paidDate).format("lll") || ""}
              </FormGroup>
              <FormGroup>
                {__("Sync Date")}: {dayjs(item?.createdAt).format("lll") || ""}
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                {__("Order No")}: {No || ""}
              </FormGroup>
              <FormGroup>
                {__("Customer no")}: {Sell_to_Customer_No || ""}
              </FormGroup>
              <FormGroup>
                {__("Customer Name")}: {Sell_to_Customer_Name || ""}
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormGroup>
            {__("Error")}: {error?.message || item.error || ""}
          </FormGroup>
          <Table $striped $bordered $responsive key={item._id}>
            <thead>
              <tr>
                <th>{__("Order No")}</th>
                <th>{__("Product Name")}</th>
                <th>{__("Product No")}</th>
                <th>{__("Price")}</th>
                <th>{__("Quantity")}</th>
                <th>{__("Error")}</th>
              </tr>
            </thead>
            <tbody id="hurData">{renderSales()}</tbody>
          </Table>
        </>
      );
    }

    return <>{item.responseStr}</>;
  };

  const mainContent = (
    <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
      <thead>
        <tr>
          {tablehead.map((p) => (
            <th key={p}>{p || ""}</th>
          ))}
        </tr>
      </thead>
      <tbody id="orders">
        {(syncHistories || []).map((item) => (
          <ModalTrigger
            title="Sync msdynamic information"
            trigger={
              <tr key={item._id}>
                <td>{dayjs(item.createdAt).format("lll")}</td>
                <td>{item.createdUser?.email}</td>
                <td>{item.contentType}</td>
                <td>{item.content}</td>
                <td>{item.error || ""}</td>
              </tr>
            }
            size="xl"
            content={(props) => rowContent(props, item)}
            key={item?._id}
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
          submenu={menuDynamic}
        />
      }
      leftSidebar={<SideBar queryParams={queryParams} loading={loading} />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__(`Sync Histories (${totalCount})`)}</Title>}
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
};

export default SyncHistoryList;
