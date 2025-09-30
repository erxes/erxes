import { AddContent, AddRow, NewBranch } from "../../styles/item";
import AssignedUsers from "./AssignedUsers";
import GenerateField from "@erxes/ui-forms/src/settings/properties/components/GenerateField";
import { IField } from "@erxes/ui/src/types";
import { LogicParams } from "@erxes/ui-forms/src/settings/properties/types";
import PipelineLabels from "./PipelineLabels";
import { checkLogic } from "@erxes/ui-forms/src/settings/properties/utils";
import SelectNewBranches from "@erxes/ui/src/team/containers/SelectNewBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";
import React, { useState, useEffect } from "react";

type Props = {
  object: any;
  fields: IField[];
  customFieldsData: any;
  onChangeField: (name: any, value: any) => void;
  pipelineId: string;
  storageKey?: string;
};

function GenerateAddFormFields(props: Props) {
  const customFields = props.fields.filter((f) => !f.isDefinedByErxes);
  const fields = props.fields.filter((f) => f.isDefinedByErxes);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("assignedUserIds");
    return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<any>({});

  useEffect(() => {
    const key = props.storageKey || "AddFormState";
    let saved = JSON.parse(localStorage.getItem(key) || "{}");
    if (!saved || !Object.keys(saved).length) {
      // fallback to legacy key
      saved = JSON.parse(localStorage.getItem("AddFormState") || "{}");
    }
    if (saved && Object.keys(saved).length) {
      setState(saved);
      setSelectedBranchIds(saved.branchIds || []);
      setAssignedUserIds(saved.assignedUserIds || []);
      if (saved.branchIds) {
        props.onChangeField("branchIds", saved.branchIds);
      }
      if (saved.assignedUserIds) {
        props.onChangeField("assignedUserIds", saved.assignedUserIds);
      }
    } else if (props.object) {
      setSelectedBranchIds(props.object.branchIds || []);
      setAssignedUserIds(props.object.assignedUserIds || []);
      setState(props.object);
    }
  }, [props.storageKey]);

  const onChangeFieldWithStorage = (name: string, value: any) => {
    props.onChangeField(name, value);
    const newState = { ...state, [name]: value };
    setState(newState);
    const key = props.storageKey || "AddFormState";
    localStorage.setItem(key, JSON.stringify(newState));
    if (name === "assignedUserIds") {
      setAssignedUserIds(value);
    }
    if (key !== "AddFormState") {
      // keep legacy key in sync for compatibility
      localStorage.setItem("AddFormState", JSON.stringify(newState));
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

    const field = props.customFieldsData.find((c) => c.field === _id);

    for (const f of customFields) {
      const logics = f.logics || [];
      if (!logics.length) continue;
      if (logics.findIndex((l) => l.fieldId && l.fieldId.includes(_id)) === -1)
        continue;

      props.customFieldsData.forEach((c) => {
        if (c.field === f._id) c.value = "";
      });
    }

    if (field) {
      field.value = value;
      if (extraValue) field.extraValue = extraValue;
      onChangeFieldWithStorage("customFieldsData", props.customFieldsData);
    } else {
      onChangeFieldWithStorage("customFieldsData", [
        ...props.customFieldsData,
        { field: _id, value, extraValue },
      ]);
    }
  };

  const onFieldsDataChange = ({ _id, value }) => {
    const field = fields.find((c) => c._id === _id);
    if (field && field.field) {
      onChangeFieldWithStorage(field.field, value);
    }
  };

  return (
    <>
      {fields.map((field, index) => {
        const renderField = () => {
          if (field.field === "labelIds") {
            return (
              <PipelineLabels
                field={field}
                pipelineId={props.pipelineId}
                onChangeField={onChangeFieldWithStorage}
              />
            );
          }

          if (field.field === "assignedUserIds") {
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
          }

          if (field.field === "branchIds") {
            return (
              <NewBranch>
                <SelectNewBranches
                  name="branchIds"
                  label="Filter by branches"
                  initialValue={selectedBranchIds}
                  onSelect={(branchIds, _name) => {
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
          }

          if (field.field === "departmentIds") {
            return (
              <FormGroup>
                <ControlLabel>Departments</ControlLabel>
                <SelectDepartments
                  label="Choose department"
                  name="departments"
                  initialValue={state.departmentIds || []}
                  multi={true}
                  onSelect={(departmentIds) =>
                    onChangeFieldWithStorage("departmentIds", departmentIds)
                  }
                />
              </FormGroup>
            );
          }

          if (field.field === "tagIds") {
            return (
              <FormGroup>
                <ControlLabel>Tags</ControlLabel>
                <SelectTags
                  tagsType="tickets:ticket"
                  name="tagIds"
                  label="Choose tags"
                  initialValue={state.tagIds || []}
                  onSelect={(tags) => onChangeFieldWithStorage("tagIds", tags)}
                  multi={true}
                />
              </FormGroup>
            );
          }

          return (
            <GenerateField
              field={field}
              key={index}
              onValueChange={onFieldsDataChange}
              branchIds={selectedBranchIds}
              isEditing={true}
            />
          );
        };

        return (
          <AddRow key={index}>
            <AddContent>{renderField()}</AddContent>
          </AddRow>
        );
      })}

      {customFields.map((field, index) => {
        const currentValue =
          field.type === "isCheckUserTicket"
            ? state.isCheckUserTicket ?? false
            : props.customFieldsData.find((c) => c.field === field._id)
                ?.value || "";

        if (field.logics && field.logics.length > 0) {
          const data: any = {};
          props.customFieldsData.forEach((f) => {
            data[f.field] = f.value;
          });

          const logics: LogicParams[] = field.logics.map((logic) => {
            let { fieldId = "" } = logic;
            if (fieldId.includes("customFieldsData")) {
              fieldId = fieldId.split(".")[1];
              return {
                fieldId,
                operator: logic.logicOperator,
                validation: fields.find((e) => e._id === fieldId)?.validation,
                logicValue: logic.logicValue,
                fieldValue: data[fieldId],
                type: field.type,
              };
            }
            const object = props.object || {};
            return {
              fieldId,
              operator: logic.logicOperator,
              logicValue: logic.logicValue,
              fieldValue: object[logic.fieldId || ""] || "",
              validation: fields.find((e) => e._id === fieldId)?.validation,
              type: field.type,
            };
          });

          if (!checkLogic(logics)) return null;
        }

        return (
          <>
            <AddRow key={index}>
              <AddContent>
                <GenerateField
                  field={field}
                  key={index}
                  defaultValue={currentValue}
                  onValueChange={onCustomFieldsDataChange}
                  branchIds={selectedBranchIds}
                  isEditing={true}
                />
              </AddContent>
            </AddRow>
          </>
        );
      })}
    </>
  );
}

export default GenerateAddFormFields;
