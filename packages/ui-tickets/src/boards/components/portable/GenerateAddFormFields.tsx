import { AddContent, AddRow, NewBranch } from "../../styles/item";
import AssignedUsers from "./AssignedUsers";
import PipelineLabels from "./PipelineLabels";
import React from "react";
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
  customFieldsData: any;
  onChangeField: (name: any, value: any) => void;
  pipelineId: string;
};

function GenerateAddFormFields(props: Props) {
  const customFields = props.fields.filter((f) => !f.isDefinedByErxes);
  const fields = props.fields.filter((f) => f.isDefinedByErxes);

  const { customFieldsData, onChangeField } = props;
  const { object = {} } = props;

  const onCustomFieldsDataChange = ({
    _id,
    value,
    extraValue,
  }: {
    _id: string;
    value: any;
    extraValue?: string;
  }) => {
    const field = customFields.find((f) => f._id === _id);
    if (field?.type === "isCheckUserTicket") {
      onChangeField("isCheckUserTicket", value);
      return;
    }

    const existingField = customFieldsData.find((c) => c.field === _id);

    for (const f of customFields) {
      const logics = f.logics || [];

      if (!logics.length) {
        continue;
      }

      if (
        logics.findIndex((l) => l.fieldId && l.fieldId.includes(_id)) === -1
      ) {
        continue;
      }

      customFieldsData.forEach((c) => {
        if (c.field === f._id) {
          c.value = "";
        }
      });
    }

    if (existingField) {
      existingField.value = value;
      if (extraValue) {
        existingField.extraValue = extraValue;
      }

      onChangeField("customFieldsData", customFieldsData);
    } else {
      onChangeField("customFieldsData", [
        ...customFieldsData,
        { field: _id, value, extraValue },
      ]);
    }
  };

  const onFieldsDataChange = ({ _id, value }) => {
    const field = fields.find((c) => c._id === _id);

    if (field && field.field) {
      onChangeField(field.field, value);
    }
  };

  return (
    <>
      {fields.map((field, index) => {
        const { branchIds = [] } = object;

        const renderFieldContent = () => {
          if (field.field === "labelIds") {
            return (
              <PipelineLabels
                field={field}
                pipelineId={props.pipelineId}
                onChangeField={onChangeField}
              />
            );
          }

          if (field.field === "assignedUserIds") {
            return (
              <AssignedUsers
                field={field}
                onChangeField={onChangeField}
                branchIds={branchIds}
                onSelect={(assignedUserIds) =>
                  onChangeField("assignedUserIds", assignedUserIds)
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
                  initialValue={branchIds}
                  onSelect={(selectedBranchIds) => {
                    onChangeField("branchIds", selectedBranchIds);
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
                  initialValue={[]}
                  multi={true}
                  onSelect={(departmentIds) => {
                    onChangeField("departmentIds", departmentIds);
                  }}
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
                  initialValue={[]}
                  onSelect={(tags) => onChangeField("tagIds", tags)}
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
              isEditing={true}
            />
          );
        };

        return (
          <AddRow key={index}>
            <AddContent>{renderFieldContent()}</AddContent>
          </AddRow>
        );
      })}

      {customFields.map((field, index) => {
        if (field.logics && field.logics.length > 0) {
          const data = {};

          customFieldsData.forEach((f) => {
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

            return {
              fieldId,
              operator: logic.logicOperator,
              logicValue: logic.logicValue,
              fieldValue: object[logic.fieldId || ""] || "",
              validation: fields.find((e) => e._id === fieldId)?.validation,
              type: field.type,
            };
          });

          if (!checkLogic(logics)) {
            return null;
          }
        }

        return (
          <AddRow key={index}>
            <AddContent>
              <GenerateField
                field={field}
                key={index}
                onValueChange={onCustomFieldsDataChange}
                isEditing={true}
              />
            </AddContent>
          </AddRow>
        );
      })}
    </>
  );
}

export default GenerateAddFormFields;
