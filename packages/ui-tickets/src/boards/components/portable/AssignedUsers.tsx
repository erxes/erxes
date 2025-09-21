import { ControlLabel, FormGroup } from "@erxes/ui/src/components";

import { IField } from "@erxes/ui/src/types";
import React from "react";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";

type Props = {
  field: IField;
  onChangeField: (name: any, value: any) => void;
  branchIds?: string[];
};

export default function AssignedUsers(props: Props) {
  const { field } = props;

  const onChange = (value: string[] | string, _name: string) => {
    const { onChangeField } = props;
    const normalized = Array.isArray(value) ? value : [value];
    onChangeField(field.field, normalized);
  };

  return (
    <FormGroup>
      <ControlLabel ignoreTrans={true} required={field.isRequired}>
        {field.text}
      </ControlLabel>
      <SelectTeamMembers
        label="Choose users"
        name="assignedUserIds"
        onSelect={onChange}
        filterParams={{
          isAssignee: !props.branchIds?.length,
          branchIds: props.branchIds,
        }}
      />
    </FormGroup>
  );
}
