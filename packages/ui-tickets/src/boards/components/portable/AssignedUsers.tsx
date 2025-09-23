import { ControlLabel, FormGroup } from "@erxes/ui/src/components";

import { IField } from "@erxes/ui/src/types";
import React from "react";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";

type Props = {
  field: IField;
  onChangeField: (name: any, value: any) => void;
  branchIds?: string[];
  assignedUserIds?: string[];
  onSelect: (value: string[] | string, name: string) => void;
};

export default function AssignedUsers(props: Props) {
  const { field, assignedUserIds, onSelect } = props;

  return (
    <FormGroup>
      <ControlLabel ignoreTrans={true} required={field.isRequired}>
        {field.text}
      </ControlLabel>
      <SelectTeamMembers
        label="Choose users"
        name="assignedUserIds"
        initialValue={assignedUserIds || []}
        onSelect={onSelect}
        filterParams={{
          isAssignee: !props.branchIds?.length,
          branchIds: props.branchIds,
        }}
      />
    </FormGroup>
  );
}
