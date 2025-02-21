import { IItem, IOptions } from "../../types";
import { __, loadDynamicComponent } from "@erxes/ui/src/utils";

import { ActionContainer } from "../../styles/item";
import { ArchiveBtn } from "./ArchiveBtn";
import ChecklistAdd from "../../../checklists/components/AddButton";
import { ColorButton } from "../../styles/common";
import Comment from "../../../comment/containers/Comment";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Watch from "../../containers/editForm/Watch";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
  currentUser: IUser;
};

class Actions extends React.Component<Props> {
  render() {
    const {
      item,
      saveItem,
      options,
      copyItem,
      removeItem,
      sendToBoard,
      onChangeStage,
      onChangeRefresh,
      currentUser,
    } = this.props;

    return (
      <ActionContainer>
        <ChecklistAdd itemId={item._id} type={options.type} />

        <Watch item={item} options={options} isSmall={true} />
        {(isEnabled("clientportal") && <Comment item={item} />) || ""}
        <ColorButton onClick={copyItem}>
          <Icon icon="copy-1" />
          {__("Copy")}
        </ColorButton>
        <ArchiveBtn
          item={item}
          removeItem={removeItem}
          saveItem={saveItem}
          sendToBoard={sendToBoard}
          onChangeStage={onChangeStage}
          currentUser={currentUser}
        />

        {loadDynamicComponent(
          "cardDetailAction",
          {
            item,
            contentType: "sales",
            subType: item.stage?.type,
            path: `stageId=${item.stageId}`,
          },
          true
        )}
        {/* {isEnabled('documents') && <PrintActionButton item={item} />} */}
      </ActionContainer>
    );
  }
}

export default Actions;
