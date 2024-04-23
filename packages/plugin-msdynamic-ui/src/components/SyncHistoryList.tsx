import {
  DataWithLoader,
  ModalTrigger,
  Pagination,
  Table,
} from "@erxes/ui/src/components";

import ChargeItem from "./ChargeItem";
import React from "react";
import SideBar from "./SideBar";
import { Title } from "@erxes/ui-settings/src/styles";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import { menuDynamic } from "../constants";

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

    if (item?.responseSales && item.responseSales.length > 0) {
      const renderSales = () => {
        return (item?.responseSales || []).map((listItem, index: number) => {
          const jsonObject = JSON.parse(listItem);

          return <ChargeItem key={index} item={jsonObject} />;
        });
      };

      return (
        <>
          <Table $striped $bordered $responsive>
            <thead>
              <tr>
                <th>{__("Error")}</th>
                <th>{__("Order No")}</th>
                <th>{__("Customer no")}</th>
                <th>{__("Customer Name")}</th>
              </tr>
            </thead>
            <tbody>
              {" "}
              <tr>
                <td>{error?.message || ""}</td>
                <td>{No || ""}</td>
                <td>{Sell_to_Customer_No || ""}</td>
                <td>{Sell_to_Customer_Name || ""}</td>
              </tr>
            </tbody>
          </Table>
          <Table $striped $bordered $responsive key={item._id}>
            <thead>
              <tr>
                <th>{__("Error")}</th>
                <th>{__("Order No")}</th>
                <th>{__("Product Name")}</th>
                <th>{__("Product No")}</th>
                <th>{__("Price")}</th>
                <th>{__("Quantity")}</th>
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
            title="Sync erkhet information"
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
