import {
  FullContainer,
  FullLeftSide,
  FullRightSide,
  HeaderContainer,
  LeftBody,
  LeftBodyContent,
} from "../styles";
import { IItem, IItemParams, IOptions } from "../../boards/types";
import { IPaymentsData, IProductData } from "../types";
import React, { useState } from "react";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";

import ActivityInputs from "@erxes/ui-log/src/activityLogs/components/ActivityInputs";
import ActivityLogs from "@erxes/ui-log/src/activityLogs/containers/ActivityLogs";
import CommonActions from "../../boards/components/editForm/CommonActions";
import FileAndDescription from "../../boards/components/editForm/FileAndDescription";
import Header from "../../boards/components/editForm/Header";
import { IProduct } from "@erxes/ui-products/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import ProductForm from "../containers/product/ProductForm";
import ProductSection from "./ProductSection";
import ProductSectionComponent from "./product/ProductSection";
import { __ } from "@erxes/ui/src/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  item: IItem;
  options: IOptions;
  copy: () => void;
  remove: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  addItem: (doc: IItemParams, callback: () => void) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
  currentUser: IUser;
  amount?: () => React.ReactNode;
};

const FullEditForm = (props: Props) => {
  const {
    item,
    options,
    onUpdate,
    sendToBoard,
    addItem,
    currentUser,
    saveItem,
    onChangeStage,
    copy,
    remove,
    amount,
    onChangeRefresh,
  } = props;
  const [currentTab, setCurrentTab] = useState("overview");

  const renderTabs = () => {
    return (
      <Tabs full>
        <TabTitle
          className={currentTab === "overview" ? "active" : ""}
          onClick={() => setCurrentTab("overview")}
        >
          {__("Overview")}
        </TabTitle>
        <TabTitle
          className={currentTab === "product" ? "active" : ""}
          onClick={() => setCurrentTab("product")}
        >
          {__("Product & Service")}
        </TabTitle>
        <TabTitle
          className={currentTab === "properties" ? "active" : ""}
          onClick={() => setCurrentTab("properties")}
        >
          {__("Properties")}
        </TabTitle>
        <TabTitle
          className={currentTab === "activity" ? "active" : ""}
          onClick={() => setCurrentTab("activity")}
        >
          {__("Activity")}
        </TabTitle>
      </Tabs>
    );
  };

  const renderOverview = () => {
    return (
      <>
        <FileAndDescription item={item} options={options} saveItem={saveItem} />
        <ActivityInputs
          contentTypeId={item._id}
          contentType={`sales:${options.type}`}
          showEmail={false}
        />
        <ActivityLogs
          target={item.name}
          contentId={item._id}
          contentType={`sales:${options.type}`}
          extraTabs={
            options.type === "tasks:task" && isEnabled("tasks")
              ? []
              : [{ name: "tasks:task", label: "Task" }]
          }
        />
      </>
    );
  };

  const renderProductService = () => {
    return (
      <ProductSectionComponent
        item={item}
        saveItem={saveItem}
        isFullMode={true}
      />
    );
  };

  const renderTabsContent = () => {
    switch (currentTab) {
      case "overview":
        return renderOverview();
      case "product":
        return renderProductService();
      case "detail":
        return <div>hi</div>;
      case "activity":
        return <div>hi</div>;
      default:
        return null;
    }
  };

  return (
    <FullContainer>
      <FullLeftSide>
        <HeaderContainer>
          <Header item={item} saveItem={saveItem} amount={amount} />
        </HeaderContainer>
        <LeftBody>
          {renderTabs()}
          <LeftBodyContent>{renderTabsContent()}</LeftBodyContent>
        </LeftBody>
      </FullLeftSide>
      <FullRightSide>
        <CommonActions
          options={options}
          saveItem={saveItem}
          copyItem={copy}
          removeItem={remove}
          onUpdate={onUpdate}
          sendToBoard={sendToBoard}
          item={item}
          addItem={addItem}
          onChangeStage={onChangeStage}
          onChangeRefresh={onChangeRefresh}
          currentUser={currentUser}
          isFullView={true}
        />
      </FullRightSide>
    </FullContainer>
  );
};

export default FullEditForm;
