import { ChooseDates, GridContainer, TitleRow } from "../../styles/item";
import { IItem, IItemParams, IOptions } from "../../types";

import Actions from "./Actions";
import Checklists from "../../../checklists/containers/Checklists";
import { ColorButton } from "../../styles/common";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DueDateChooser from "./DueDateChooser";
import FileAndDescription from "./FileAndDescription";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import LabelChooser from "../../containers/label/LabelChooser";
import Labels from "../label/Labels";
import { PopoverButton } from "@erxes/ui-inbox/src/inbox/styles";
import React from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import Tags from "@erxes/ui/src/components/Tags";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  addItem: (doc: IItemParams, callback: () => void) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
  currentUser: IUser;
  isFullView?: boolean;
};

const CommonActions = (props: Props) => {
  const {
    item,
    saveItem,
    options,
    copyItem,
    removeItem,
    onUpdate,
    addItem,
    sendToBoard,
    onChangeStage,
    onChangeRefresh,
    currentUser,
    isFullView,
  } = props;

  const userOnChange = (usrs) => saveItem({ assignedUserIds: usrs });
  const onChangeStructure = (values, name) => saveItem({ [name]: values });
  const onLabelChange = (labels) => saveItem({ labels });

  const assignedUserIds = (item.assignedUsers || []).map((user) => user._id);
  const branchIds = currentUser.branchIds;
  const departmentIds = currentUser.departmentIds;

  const tags = item.tags || [];
  const TAG_TYPE = TAG_TYPES.DEAL;
  const pipelineTagId = item.pipeline.tagId || "";

  const tagTrigger = (
    <PopoverButton id="conversationTags">
      {tags.length ? (
        <>
          <Tags tags={tags} limit={1} /> <Icon icon="angle-down" />
        </>
      ) : (
        <ColorButton>
          <Icon icon="tag-alt" /> No tags
        </ColorButton>
      )}
    </PopoverButton>
  );

  return (
    <>
      <FormGroup>
        <TitleRow>
          <ControlLabel uppercase={true}>{__("Actions")}</ControlLabel>
        </TitleRow>
        <Actions
          item={item}
          options={options}
          copyItem={copyItem}
          removeItem={removeItem}
          saveItem={saveItem}
          onUpdate={onUpdate}
          sendToBoard={sendToBoard}
          onChangeStage={onChangeStage}
          onChangeRefresh={onChangeRefresh}
          currentUser={currentUser}
        />
      </FormGroup>

      {isFullView && (
        <DueDateChooser item={item} saveItem={saveItem} onUpdate={onUpdate} />
      )}

      <FormGroup>
        <ControlLabel uppercase={true}>Assigned to</ControlLabel>
        <SelectTeamMembers
          label="Choose users"
          name="assignedUserIds"
          initialValue={assignedUserIds}
          onSelect={userOnChange}
          filterParams={{
            isAssignee: true,
            departmentIds,
            branchIds,
          }}
        />
      </FormGroup>

      <GridContainer $isFull={isFullView}>
        <FormGroup>
          <ControlLabel uppercase={true}>{__("Branches")}</ControlLabel>
          <SelectBranches
            name="branchIds"
            label="Choose branches"
            initialValue={item?.branchIds}
            onSelect={onChangeStructure}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel uppercase={true}>{__("Departments")}</ControlLabel>
          <SelectDepartments
            name="departmentIds"
            label="Choose departments"
            onSelect={onChangeStructure}
            initialValue={item?.departmentIds}
          />
        </FormGroup>
      </GridContainer>

      <GridContainer $isFull={isFullView}>
        <FormGroup>
          <TitleRow>
            <ControlLabel uppercase={true}>{__("Labels")}</ControlLabel>
          </TitleRow>

          <ChooseDates>
            <Labels labels={item.labels} />
            <LabelChooser
              item={item}
              onSelect={onLabelChange}
              onChangeRefresh={onChangeRefresh}
            />
          </ChooseDates>
        </FormGroup>

        <FormGroup>
          <TitleRow>
            <ControlLabel uppercase={true}>{__("Tags")}</ControlLabel>
          </TitleRow>
          <ChooseDates>
            <TaggerPopover
              type={TAG_TYPE}
              trigger={tagTrigger}
              refetchQueries={["dealDetail"]}
              targets={[item]}
              parentTagId={pipelineTagId}
              singleSelect={false}
            />
          </ChooseDates>
        </FormGroup>
      </GridContainer>

      {!isFullView && (
        <FileAndDescription item={item} options={options} saveItem={saveItem} />
      )}

      <Checklists
        contentType={options.type}
        contentTypeId={item._id}
        stageId={item.stageId}
        addItem={addItem}
      />
    </>
  );
};

export default CommonActions;
