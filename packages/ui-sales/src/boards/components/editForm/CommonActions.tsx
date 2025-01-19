import {
  ChooseDates,
  Content,
  ContentWrapper,
  GridContainer,
  TitleRow,
} from "../../styles/item";
import {
  EditorActions,
  EditorWrapper,
} from "@erxes/ui-internalnotes/src/components/Form";
import { IItem, IItemParams, IOptions } from "../../types";
import React, { useEffect, useState } from "react";
import { __, extractAttachment } from "@erxes/ui/src/utils";

import Actions from "./Actions";
import Button from "@erxes/ui/src/components/Button";
import Checklists from "../../../checklists/containers/Checklists";
import { ColorButton } from "../../styles/common";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IAttachment } from "@erxes/ui/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import LabelChooser from "../../containers/label/LabelChooser";
import Labels from "../label/Labels";
import { PopoverButton } from "@erxes/ui-inbox/src/inbox/styles";
import { RichTextEditor } from "@erxes/ui/src/components/richTextEditor/TEditor";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import Tags from "@erxes/ui/src/components/Tags";
import Uploader from "@erxes/ui/src/components/Uploader";
import xss from "xss";

type DescProps = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  contentType: string;
};

const Description = (props: DescProps) => {
  const { item, saveItem, contentType } = props;
  const [edit, setEdit] = useState(false);
  const [isSubmitted, setSubmit] = useState(false);
  const [description, setDescription] = useState(item.description);

  useEffect(() => {
    setDescription(item.description);
  }, [item.description]);

  useEffect(() => {
    if (isSubmitted) {
      setEdit(false);
    }
  }, [isSubmitted]);

  const onSend = () => {
    saveItem({ description });
    setSubmit(true);
  };

  const toggleEdit = () => {
    setEdit((currentValue) => !currentValue);
    setSubmit(false);
  };

  const onChangeDescription = (content: string) => {
    setDescription(content);
  };

  const renderFooter = () => {
    return (
      <EditorActions>
        <Button
          icon="times-circle"
          btnStyle="simple"
          size="small"
          onClick={toggleEdit}
        >
          Cancel
        </Button>
        {item.description !== description && (
          <Button
            onClick={onSend}
            btnStyle="success"
            size="small"
            icon="check-circle"
          >
            Save
          </Button>
        )}
      </EditorActions>
    );
  };

  return (
    <FormGroup>
      <ContentWrapper $isEditing={edit}>
        <TitleRow>
          <ControlLabel uppercase={true}>
            <Icon icon="align-left-justify" />
            {__("Description")}
          </ControlLabel>
        </TitleRow>

        {!edit ? (
          <Content
            onClick={toggleEdit}
            dangerouslySetInnerHTML={{
              __html: item.description
                ? xss(item.description)
                : `${__("Add a more detailed description")}...`,
            }}
          />
        ) : (
          <EditorWrapper>
            <RichTextEditor
              content={description}
              onChange={onChangeDescription}
              height={"max-content"}
              isSubmitted={isSubmitted}
              autoFocus={true}
              name={`${contentType}_description_${item._id}`}
              toolbar={[
                "bold",
                "italic",
                "orderedList",
                "bulletList",
                "link",
                "unlink",
                "|",
                "image",
              ]}
              onCtrlEnter={onSend}
            />

            {renderFooter()}
          </EditorWrapper>
        )}
      </ContentWrapper>
    </FormGroup>
  );
};

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
  } = props;

  const onChangeAttachment = (files: IAttachment[]) =>
    saveItem({ attachments: files });

  const attachments =
    (item.attachments && extractAttachment(item.attachments)) || [];
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
        />
      </FormGroup>

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

      <GridContainer>
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

      <GridContainer>
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

      <FormGroup>
        <TitleRow>
          <ControlLabel uppercase={true}>
            <Icon icon="paperclip" />
            {__("Attachments")}
          </ControlLabel>
        </TitleRow>

        <Uploader defaultFileList={attachments} onChange={onChangeAttachment} />
      </FormGroup>

      <Description item={item} saveItem={saveItem} contentType={options.type} />

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
