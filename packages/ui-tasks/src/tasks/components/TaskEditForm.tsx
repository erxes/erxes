import {
  IEditFormContent,
  IItem,
  IItemParams,
  IOptions
} from "../../boards/types";

import ChildrenSection from "../../boards/containers/editForm/ChildrenSection";
import EditForm from "../../boards/components/editForm/EditForm";
import { Flex } from "@erxes/ui/src/styles/main";
import { IUser } from "@erxes/ui/src/auth/types";
import Left from "../../boards/components/editForm/Left";
import React from "react";
import Sidebar from "../../boards/components/editForm/Sidebar";
import Top from "../../boards/components/editForm/Top";
import { loadDynamicComponent } from "@erxes/ui/src/utils";
import queryString from "query-string";
import PortableDeals from "@erxes/ui-sales/src/deals/components/PortableDeals";
import PortablePurchases from "@erxes/ui-purchases/src/purchases/components/PortablePurchases";
import { isEnabled } from "@erxes/ui/src/utils/core";
import PortableTickets from "@erxes/ui-tickets/src/tickets/components/PortableTickets";

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IItemParams, callback?: (item) => void) => void;
  copyItem: (itemId: string, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
  beforePopupClose: () => void;
  sendToBoard?: (item: any) => void;
  currentUser: IUser;
};

type State = {
  refresh: boolean;
};

export default class TaskEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      refresh: false
    };
  }

  onChangeRefresh = () => {
    this.setState({
      refresh: !this.state.refresh
    });
  };

  renderItems = () => {
    return (
      <>
        {isEnabled("sales") && (
          <PortableDeals mainType="task" mainTypeId={this.props.item._id} />
        )}
        {isEnabled("purchases") && (
          <PortablePurchases mainType="task" mainTypeId={this.props.item._id} />
        )}

        {isEnabled("tickets") && (
          <PortableTickets mainType="task" mainTypeId={this.props.item._id} />
        )}

        {loadDynamicComponent(
          "taskRightSidebarSection",
          {
            id: this.props.item._id,
            mainType: "task",
            mainTypeId: this.props.item._id,
            object: this.props.item
          },
          true
        )}
      </>
    );
  };

  renderChildrenSection = () => {
    const { item } = this.props;

    const updatedProps = {
      ...this.props,
      type: "task",
      itemId: item._id,
      stageId: item.stageId,
      pipelineId: item.pipeline._id,
      queryParams: queryString.parse(window.location.search) || {}
    };

    return <ChildrenSection {...updatedProps} />;
  };

  renderFormContent = ({
    state,
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) => {
    const {
      item,
      currentUser,
      options,
      onUpdate,
      addItem,
      sendToBoard,
      updateTimeTrack
    } = this.props;

    return (
      <>
        <Top
          options={options}
          stageId={state.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
        />

        <Flex>
          <Left
            options={options}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            onUpdate={onUpdate}
            sendToBoard={sendToBoard}
            item={item}
            addItem={addItem}
            onChangeStage={onChangeStage}
            onChangeRefresh={this.onChangeRefresh}
          />

          <Sidebar
            options={options}
            item={item}
            saveItem={saveItem}
            updateTimeTrack={updateTimeTrack}
            renderItems={this.renderItems}
            childrenSection={this.renderChildrenSection}
            currentUser={currentUser}
          />
        </Flex>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      extraFields: this.state,
      refresh: this.state.refresh
    };

    return <EditForm {...extendedProps} />;
  }
}
