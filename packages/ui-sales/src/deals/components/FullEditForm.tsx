import {
  FullContainer,
  FullLeftSide,
  FullRightSide,
  HeaderContainer,
  LeftBody,
  LeftBodyContent,
} from "../styles";
import { IItem, IItemParams, IOptions } from "../../boards/types";
import React, { useState } from "react";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";
import TaskTimer, { STATUS_TYPES } from "@erxes/ui/src/components/Timer";
import {
  isEnabled,
  loadDynamicTabContent,
  loadDynamicTabTitle,
} from "@erxes/ui/src/utils/core";

import ActivityInputs from "@erxes/ui-log/src/activityLogs/components/ActivityInputs";
import ActivityLogs from "@erxes/ui-log/src/activityLogs/containers/ActivityLogs";
import ChildrenSection from "../../boards/containers/editForm/ChildrenSection";
import CommonActions from "../../boards/components/editForm/CommonActions";
import CustomFieldsSection from "../../boards/containers/editForm/CustomFieldsSection";
import DealDynamicComponent from "./DynamicComponent";
import FileAndDescription from "../../boards/components/editForm/FileAndDescription";
import Header from "../../boards/components/editForm/Header";
import { HeaderContent } from "../../boards/styles/item";
import { IUser } from "@erxes/ui/src/auth/types";
import Move from "../../boards/containers/editForm/Move";
import ProductSectionComponent from "./product/ProductSectionComponent";
import SidebarConformity from "../../boards/components/editForm/SidebarConformity";
import { __ } from "@erxes/ui/src/utils";
import queryString from "query-string";

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
  renderItems: () => React.ReactNode;
  currentUser: IUser;
  amount?: () => React.ReactNode;
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent,
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
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
    updateTimeTrack,
    renderItems,
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
          className={currentTab === "detail" ? "active" : ""}
          onClick={() => setCurrentTab("detail")}
        >
          {__("Details")}
        </TabTitle>
        <TabTitle
          className={currentTab === "properties" ? "active" : ""}
          onClick={() => setCurrentTab("properties")}
        >
          {__("Properties")}
        </TabTitle>

        <TabTitle
          className={currentTab === "dynamic" ? "active" : ""}
          onClick={() => setCurrentTab("dynamic")}
        >
          {loadDynamicTabTitle(
            "dealRightSidebarTab",
            {
              id: item._id,
              mainType: "deal",
              mainTypeId: item._id,
              object: item,
            },
            true
          )}
        </TabTitle>
      </Tabs>
    );
  };

  const renderOverview = () => {
    function renderMove() {
      const { options, onChangeStage, item } = props;

      return (
        <Move
          options={options}
          item={item}
          stageId={item.stageId}
          onChangeStage={onChangeStage}
          hasGreyBackground={true}
        />
      );
    }

    return (
      <>
        <HeaderContent>{renderMove()}</HeaderContent>
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

  const renderChildrenSection = () => {
    const updatedProps = {
      ...props,
      type: "deal",
      itemId: item._id,
      stageId: item.stageId,
      pipelineId: item.pipeline._id,
      options,
      queryParams: queryString.parse(window.location.search) || {},
    };

    return <ChildrenSection {...updatedProps} />;
  };

  const renderTabsContent = () => {
    switch (currentTab) {
      case "overview":
        return renderOverview();
      case "product":
        return renderProductService();
      case "detail":
        return <DealDynamicComponent item={item} />;
      case "properties":
        return (
          <CustomFieldsSection item={item} options={options} showType="list" />
        );
      case "dynamic":
        return loadDynamicTabContent(
          "dealRightSidebarTab",
          {
            id: item._id,
            mainType: "deal",
            mainTypeId: item._id,
            object: item,
          },
          true
        );
      default:
        return null;
    }
  };

  const timeTrack = item.timeTrack || {
    timeSpent: 0,
    status: STATUS_TYPES.STOPPED,
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
        <TaskTimer
          taskId={item._id}
          status={timeTrack.status}
          timeSpent={timeTrack.timeSpent}
          startDate={timeTrack.startDate}
          update={updateTimeTrack}
        />
        <SidebarConformity
          options={options}
          item={item}
          saveItem={saveItem}
          renderItems={renderItems}
        />
        {renderChildrenSection()}
      </FullRightSide>
    </FullContainer>
  );
};

export default FullEditForm;
