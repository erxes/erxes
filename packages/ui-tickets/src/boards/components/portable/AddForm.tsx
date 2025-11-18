import * as _ from "lodash";
import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import {
  BoardSelectWrapper,
  FormFooter,
  HeaderContent,
  HeaderRow,
} from "../../styles/item";
import { IAttachment, IField } from "@erxes/ui/src/types";
import { IItem, IItemParams, IOptions, IStage } from "../../types";
import { Alert } from "@erxes/ui/src/utils";
import { checkLogic } from "@erxes/ui-forms/src/settings/properties/utils";
import { LogicParams } from "@erxes/ui-forms/src/settings/properties/types";
import { invalidateCache } from "../../utils";
import BoardSelect from "../../containers/BoardSelect";
import Button from "@erxes/ui/src/components/Button";
import CardSelect from "./CardSelect";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import GenerateAddFormFields from "./GenerateAddFormFields";
import RelationForm from "@erxes/ui-forms/src/forms/containers/RelationForm";

type Props = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  cardId?: string;
  mailSubject?: string;
  showSelect?: boolean;
  saveItem: (doc: IItemParams, callback: (item: IItem) => void) => void;
  closeModal: () => void;
  callback?: (item?: IItem) => void;
  fields: IField[];
  refetchFields: ({ pipelineId }: { pipelineId: string }) => void;
  stages?: IStage[];
  tagIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  showStageSelect?: boolean;
  fetchCards: (stageId: string, callback: (cards: any) => void) => void;
  isHideName?: boolean;
};

const AddForm: React.FC<Props> = ({
  options,
  boardId: propBoardId,
  pipelineId: propPipelineId,
  stageId: propStageId,
  cardId: propCardId,
  mailSubject,
  showSelect,
  saveItem,
  closeModal,
  callback,
  fields: propFields,
  refetchFields,
  stages,
  tagIds: propTagIds,
  startDate: propStartDate,
  closeDate: propCloseDate,
  showStageSelect,
  fetchCards,
  isHideName: propIsHideName,
}) => {
  const type = options.type;

  const [boardId, setBoardId] = useState(
    localStorage.getItem(`${type}_boardId`) || propBoardId || "",
  );
  const [pipelineId, setPipelineId] = useState(
    localStorage.getItem(`${type}_pipelineId`) || propPipelineId || "",
  );
  const [stageId, setStageId] = useState(
    propStageId || localStorage.getItem(`${type}_stageId`) || "",
  );
  const [cardId, setCardId] = useState(propCardId || "");
  const [name, setName] = useState(
    localStorage.getItem(`${type}_name`) || mailSubject || "",
  );
  const [description, setDescription] = useState(
    localStorage.getItem(`${type}_description`) || "",
  );
  const [cards, setCards] = useState<any[]>([]);
  const [fields, setFields] = useState<IField[]>(
    (() => {
      const stored = localStorage.getItem(`${type}_fields`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
      return propFields || [];
    })(),
  );
  const [customFieldsData, setCustomFieldsData] = useState<any[]>(
    (() => {
      const stored = localStorage.getItem(`${type}_customFieldsData`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
      return [];
    })(),
  );
  const [disabled, setDisabled] = useState(false);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [labelIds, setLabelIds] = useState<string[] | undefined>(undefined);
  const [assignedUserIds, setAssignedUserIds] = useState<string[] | undefined>(
    undefined,
  );
  const [attachments, setAttachments] = useState<IAttachment[] | undefined>(
    undefined,
  );
  const [branchIds, setBranchIds] = useState<string[] | undefined>(undefined);
  const [departmentIds, setDepartmentIds] = useState<string[] | undefined>(
    undefined,
  );
  const [isCheckUserTicket, setIsCheckUserTicket] = useState(
    JSON.parse(localStorage.getItem(`${type}_isCheckUserTicket`) || "false"),
  );
  const [tagIds, setTagIds] = useState(propTagIds || []);
  const [startDate, setStartDate] = useState<Date | undefined>(propStartDate);
  const [closeDate, setCloseDate] = useState<Date | undefined>(propCloseDate);
  const [relationData, setRelationData] = useState<any>({});
  const [isHideName, setIsHideName] = useState(
    JSON.parse(localStorage.getItem(`${type}_isHideName`) || "false"),
  );

  // Sync fields if prop changes
  useEffect(() => {
    if (propFields !== fields) setFields(propFields);
  }, [propFields]);

  // Fetch cards when stageId changes
  useEffect(() => {
    if (stageId) {
      fetchCards(stageId, (cards: any) => {
        setCards(
          (cards || []).map((c: any) => ({
            value: c._id,
            label: c.name,
          })),
        );
      });
      localStorage.setItem(`${type}_stageId`, stageId);
    }
  }, [stageId]);

  const onChangeField = useCallback(
    <T extends keyof any>(key: T, value: any) => {
      switch (key) {
        case "stageId":
          setStageId(value);
          localStorage.setItem(`${type}_stageId`, value);
          break;
        case "pipelineId":
          setPipelineId(value);
          refetchFields({ pipelineId: value });
          localStorage.setItem(`${type}_pipelineId`, value);
          break;
        case "boardId":
          setBoardId(value);
          localStorage.setItem(`${type}_boardId`, value);
          break;
        case "name":
          setName(value);
          localStorage.setItem(`${type}_name`, value);
          break;
        case "description":
          setDescription(value);
          localStorage.setItem(`${type}_description`, value);
          break;
        case "customFieldsData":
          setCustomFieldsData(value);
          localStorage.setItem(
            `${type}_customFieldsData`,
            JSON.stringify(value),
          );
          break;
        case "isHideName":
          setIsHideName(value);
          localStorage.setItem(`${type}_isHideName`, JSON.stringify(value));
          break;

        case "isCheckUserTicket":
          setIsCheckUserTicket(value);
          localStorage.setItem(
            `${type}_isCheckUserTicket`,
            JSON.stringify(value),
          );
          break;
        case "priority":
          setPriority(value);
          localStorage.setItem(`${type}_priority`, value);
          break;
        case "labelIds":
          setLabelIds(value);
          localStorage.setItem(`${type}_labelIds`, JSON.stringify(value));
          break;
        case "assignedUserIds":
          setAssignedUserIds(value);
          localStorage.setItem(
            `${type}_assignedUserIds`,
            JSON.stringify(value),
          );
          break;
        case "attachments":
          setAttachments(value);
          localStorage.setItem(`${type}_attachments`, JSON.stringify(value));
          break;
        case "branchIds":
          setBranchIds(value);
          localStorage.setItem(`${type}_branchIds`, JSON.stringify(value));
          break;
        case "departmentIds":
          setDepartmentIds(value);
          localStorage.setItem(`${type}_departmentIds`, JSON.stringify(value));
          break;
        case "startDate":
          setStartDate(value);
          localStorage.setItem(`${type}_startDate`, value.toString());
          break;
        case "closeDate":
          setCloseDate(value);
          localStorage.setItem(`${type}_closeDate`, value.toString());
          break;
      }
    },
    [type, refetchFields],
  );

  const save = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stageId) return Alert.error("No stage");

      let hasCheckUserTicketField = false;

      const validFields = fields.filter((field) => {
        const logics: LogicParams[] = (field.logics || []).map((logic) => {
          let { fieldId = "" } = logic;
          if (fieldId.includes("customFieldsData"))
            fieldId = fieldId.split(".")[1];
          return {
            fieldId,
            operator: logic.logicOperator,
            logicValue: logic.logicValue,
            fieldValue: (
              customFieldsData.find((c) => c.field === fieldId) || {}
            ).value,
            validation: fields.find((f) => f._id === fieldId)?.validation,
            type: field.type,
          };
        });

        if (checkLogic(logics)) return field;
      });

      for (const field of validFields) {
        if (!field) continue;
        if (field.type === "isCheckUserTicket") hasCheckUserTicketField = true;

        const customField =
          customFieldsData.find((c) => c.field === field._id) || {};
        let alert = false;
        if (field.isRequired) {
          if (field.isDefinedByErxes && !(customField.value || ({} as any)))
            alert = true;
          if (!field.isDefinedByErxes && !customField.value) alert = true;
          if (!_.isEmpty(customField) && field._id !== customField.field)
            alert = false;
          if (alert)
            return Alert.error("Please enter or choose a required field");
        }
      }

      const doc: any = {
        name,
        stageId,
        customFieldsData,
        _id: cardId,
        priority,
        labelIds,
        assignedUserIds,
        attachments,
        branchIds,
        departmentIds,
        startDate,
        closeDate,
        description,
        tagIds,
        relationData,
      };

      if (hasCheckUserTicketField || isCheckUserTicket)
        doc.isCheckUserTicket = !!isCheckUserTicket;

      setDisabled(true);

      saveItem(doc, (item: IItem) => {
        setDisabled(false);

        // Clear localStorage
        const keysToRemove = [
          `${type}_name`,
          `${type}_stageId`,
          `${type}_boardId`,
          `${type}_pipelineId`,
          `${type}_isHideName`,
          `${type}_fields`,
          `${type}_priority`,
          `${type}_labelIds`,
          `${type}_startDate`,
          `${type}_closeDate`,
          `${type}_assignedUserIds`,
          `${type}_attachments`,
          `${type}_description`,
          `${type}_tagIds`,
          `${type}_relationData`,
          `${type}_departmentIds`,
          `${type}_branchIds`,
          `${type}_isCheckUserTicket`,
          `${type}_customFieldsData`,
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem("AddFormState");
        localStorage.removeItem("assignedUserIds");

        closeModal();
        if (callback) callback(item);
        invalidateCache();
      });
    },
    [
      stageId,
      name,
      cardId,
      priority,
      labelIds,
      assignedUserIds,
      attachments,
      branchIds,
      departmentIds,
      startDate,
      closeDate,
      description,
      tagIds,
      relationData,
      isCheckUserTicket,
      fields,
      customFieldsData,
      saveItem,
      closeModal,
      callback,
      type,
    ],
  );

  const onRelationsChange = useCallback(
    (ids: string[], relationType: string) => {
      setRelationData((prev) => ({
        ...prev,
        [relationType.split(":")[1]]: ids,
      }));
    },
    [],
  );

  const renderSelect = () => {
    if (!showSelect) return null;
    const stageValues =
      stages?.map((stage) => ({ label: stage.name, value: stage._id })) || [];

    return (
      <BoardSelectWrapper>
        <BoardSelect
          type={type}
          stageId={stageId}
          pipelineId={pipelineId}
          boardId={boardId}
          onChangeStage={(id) => onChangeField("stageId", id)}
          onChangeBoard={(id) => onChangeField("boardId", id)}
          onChangePipeline={(id, _stages, hideName) => {
            onChangeField("pipelineId", id);
            onChangeField("isHideName", !!hideName);
          }}
        />
      </BoardSelectWrapper>
    );
  };

  return (
    <form onSubmit={save}>
      {renderSelect()}
      {!isHideName && (
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required>Name</ControlLabel>
            {showSelect ? (
              <CardSelect
                placeholder={`Add a new ${type} or select one`}
                options={cards}
                onChange={(option: any) => {
                  if (option.cardId && option.cardId !== "copiedItem") {
                    onChangeField("name", option.name);
                    onChangeField("cardId", option.cardId);
                  } else {
                    onChangeField("cardId", "");
                    onChangeField("name", option.name);
                  }
                }}
                type={type}
                additionalValue={name}
              />
            ) : (
              <FormControl
                value={name}
                autoFocus
                placeholder="Create a new card"
                onChange={(e) => onChangeField("name", e.target.value)}
              />
            )}
          </HeaderContent>
        </HeaderRow>
      )}

      {showStageSelect && (
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required>Stage</ControlLabel>
            <Select
              placeholder="Select a stage"
              value={stages?.find((s) => s._id === stageId) || null}
              options={
                stages?.map((s) => ({ label: s.name, value: s._id })) || []
              }
              name="stage"
              isClearable
              onChange={(e: any) => onChangeField("stageId", e?.value || "")}
            />
          </HeaderContent>
        </HeaderRow>
      )}

      <GenerateAddFormFields
        object={{
          stageId,
          name,
          cardId,
          description,
          customFieldsData,
          priority,
          labelIds,
          assignedUserIds,
          attachments,
          branchIds,
          departmentIds,
          startDate,
          closeDate,
          tagIds,
          relationData,
          isCheckUserTicket,
        }}
        pipelineId={pipelineId}
        onChangeField={onChangeField}
        customFieldsData={customFieldsData}
        fields={fields}
      />

      <RelationForm
        onChange={onRelationsChange}
        contentType={`tickets:${type}`}
        {...{
          options,
          boardId,
          pipelineId,
          stageId,
          cardId,
          mailSubject,
          showSelect,
          saveItem,
          closeModal,
          callback,
          fields,
          refetchFields,
          stages,
          tagIds: tagIds,
          startDate,
          closeDate,
          showStageSelect,
          fetchCards,
          isHideName,
        }}
      />

      <FormFooter>
        <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
          Close
        </Button>
        <Button
          disabled={disabled}
          btnStyle="success"
          icon="check-circle"
          type="submit"
        >
          Save
        </Button>
      </FormFooter>
    </form>
  );
};

export default AddForm;
