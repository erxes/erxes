import React, { useState, useEffect } from "react";

import { AddContent, AddRow, NewBranch } from "../../styles/item";
import AssignedUsers from "./AssignedUsers";
import PipelineLabels from "./PipelineLabels";

import GenerateField from "@erxes/ui-forms/src/settings/properties/components/GenerateField";
import { IField } from "@erxes/ui/src/types";
import { LogicParams } from "@erxes/ui-forms/src/settings/properties/types";
import { checkLogic } from "@erxes/ui-forms/src/settings/properties/utils";

import SelectNewBranches from "@erxes/ui/src/team/containers/SelectNewBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";

type Props = {
  object: any;
  fields: IField[];
  customFieldsData: any[];
  onChangeField: (name: string, value: any) => void;
  pipelineId: string;
  storageKey?: string;
};

function GenerateAddFormFields({
  object,
  fields: allFields,
  customFieldsData,
  onChangeField,
  pipelineId,
  storageKey,
}: Props) {
  const customFields = allFields.filter((f) => !f.isDefinedByErxes);
  const systemFields = allFields.filter((f) => f.isDefinedByErxes);

  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("assignedUserIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [state, setState] = useState<any>({});

  // Load persisted state
  useEffect(() => {
    const key = storageKey || "AddFormState";
    let saved = JSON.parse(localStorage.getItem(key) || "{}");

    if (!saved || !Object.keys(saved).length) {
      saved = JSON.parse(localStorage.getItem("AddFormState") || "{}");
    }

    if (saved && Object.keys(saved).length) {
      setState(saved);
      setSelectedBranchIds(saved.branchIds || []);
      setAssignedUserIds(saved.assignedUserIds || []);

      if (saved.branchIds) onChangeField("branchIds", saved.branchIds);
      if (saved.assignedUserIds)
        onChangeField("assignedUserIds", saved.assignedUserIds);
    } else if (object) {
      setSelectedBranchIds(object.branchIds || []);
      setAssignedUserIds(object.assignedUserIds || []);
      setState(object);
    }
  }, [storageKey]);

  // Save + sync localStorage
  const onChangeFieldWithStorage = (name: string, value: any) => {
    onChangeField(name, value);
    const newState = { ...state, [name]: value };
    setState(newState);

    const key = storageKey || "AddFormState";
    localStorage.setItem(key, JSON.stringify(newState));

    if (name === "assignedUserIds") {
      setAssignedUserIds(value);
    }
    if (key !== "AddFormState") {
      localStorage.setItem("AddFormState", JSON.stringify(newState));
    }
  };

  const onFieldsDataChange = ({ _id, value }: { _id: string; value: any }) => {
    const field = systemFields.find((c) => c._id === _id);
    if (field?.field) {
      onChangeFieldWithStorage(field.field, value);
    }
  };

  const onCustomFieldsDataChange = ({
    _id,
    name,
    value,
    extraValue,
  }: {
    _id: string;
    name?: string;
    value: any;
    extraValue?: string;
  }) => {
    if (name === "isCheckUserTicket") {
      onChangeFieldWithStorage(name, value);
      return;
    }

    const existing = customFieldsData.find((c) => c.field === _id);

    // clear dependent logic fields
    for (const f of customFields) {
      const logics = f.logics || [];
      if (!logics.length) continue;
      if (logics.findIndex((l) => l.fieldId && l.fieldId.includes(_id)) === -1)
        continue;

      customFieldsData.forEach((c) => {
        if (c.field === f._id) c.value = "";
      });
    }

    if (existing) {
      existing.value = value;
      if (extraValue) existing.extraValue = extraValue;
      onChangeFieldWithStorage("customFieldsData", [...customFieldsData]);
    } else {
      onChangeFieldWithStorage("customFieldsData", [
        ...customFieldsData,
        { field: _id, value, extraValue },
      ]);
    }
  };

  // Render system fields
  const renderSystemField = (field: IField) => {
    switch (field.field) {
      case "labelIds":
        return (
          <PipelineLabels
            field={field}
            pipelineId={pipelineId}
            onChangeField={onChangeFieldWithStorage}
          />
        );
      case "assignedUserIds":
        return (
          <AssignedUsers
            field={field}
            onChangeField={setAssignedUserIds}
            branchIds={selectedBranchIds || []}
            assignedUserIds={assignedUserIds || []}
            onSelect={(assignedUserIds) =>
              onChangeFieldWithStorage("assignedUserIds", assignedUserIds)
            }
          />
        );
      case "branchIds":
        return (
          <NewBranch>
            <SelectNewBranches
              name="branchIds"
              label="Filter by branches"
              initialValue={selectedBranchIds}
              onSelect={(branchIds) => {
                const normalized = Array.isArray(branchIds)
                  ? branchIds
                  : [branchIds];

                if (
                  JSON.stringify(selectedBranchIds) !==
                  JSON.stringify(normalized)
                ) {
                  setAssignedUserIds([]);
                  onChangeFieldWithStorage("assignedUserIds", []);
                }

                setSelectedBranchIds(normalized);
                onChangeFieldWithStorage("branchIds", normalized);
              }}
              filterParams={{ withoutUserFilter: true, searchValue: "" }}
            />
          </NewBranch>
        );
      case "departmentIds":
        return (
          <FormGroup>
            <ControlLabel>Departments</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departments"
              initialValue={state.departmentIds || []}
              multi
              onSelect={(ids) => onChangeFieldWithStorage("departmentIds", ids)}
            />
          </FormGroup>
        );
      case "tagIds":
        return (
          <FormGroup>
            <ControlLabel>Tags</ControlLabel>
            <SelectTags
              tagsType="tickets:ticket"
              name="tagIds"
              label="Choose tags"
              initialValue={state.tagIds || []}
              multi
              onSelect={(tags) => onChangeFieldWithStorage("tagIds", tags)}
            />
          </FormGroup>
        );
      default:
        return (
          <GenerateField
            field={field}
            defaultValue={field.field ? state[field.field] ?? "" : ""}
            onValueChange={onFieldsDataChange}
            branchIds={selectedBranchIds}
            isEditing
          />
        );
    }
  };

  return (
    <>
      {systemFields.map((field) => (
        <AddRow key={field._id}>
          <AddContent>{renderSystemField(field)}</AddContent>
        </AddRow>
      ))}

      {customFields.map((field) => {
        const currentValue =
          field.type === "isCheckUserTicket"
            ? state.isCheckUserTicket ?? false
            : customFieldsData.find((c) => c.field === field._id)?.value || "";

        if (field.logics?.length) {
          const data: Record<string, any> = {};
          customFieldsData.forEach((f) => (data[f.field] = f.value));

          const logics: LogicParams[] = field.logics.map((logic) => {
            let { fieldId = "" } = logic;
            if (fieldId.includes("customFieldsData")) {
              fieldId = fieldId.split(".")[1];
              return {
                fieldId,
                operator: logic.logicOperator,
                validation: systemFields.find((e) => e._id === fieldId)
                  ?.validation,
                logicValue: logic.logicValue,
                fieldValue: data[fieldId],
                type: field.type,
              };
            }
            return {
              fieldId,
              operator: logic.logicOperator,
              logicValue: logic.logicValue,
              fieldValue: (object || {})[logic.fieldId || ""] || "",
              validation: systemFields.find((e) => e._id === fieldId)
                ?.validation,
              type: field.type,
            };
          });

          if (!checkLogic(logics)) return null;
        }

        return (
          <AddRow key={field._id}>
            <AddContent>
              <GenerateField
                field={field}
                defaultValue={currentValue}
                onValueChange={onCustomFieldsDataChange}
                branchIds={selectedBranchIds}
                isEditing
              />
            </AddContent>
          </AddRow>
        );
      })}
    </>
  );
}

export default GenerateAddFormFields;
