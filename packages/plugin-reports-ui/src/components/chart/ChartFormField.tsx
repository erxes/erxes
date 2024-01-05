import SelectTags from '@erxes/ui-tags/src/containers/SelectTags';
import { ControlLabel, SelectTeamMembers } from '@erxes/ui/src';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';

import React, { useState } from 'react';
import Select from 'react-select-plus';

type Props = {
  fieldType: string;
  fieldQuery: string;
  multi?: boolean;
  fieldLabel: string;
  fieldOptions: any[];
  initialValue?: any;
  onChange: (input: any) => void;
  valtotalHoursWorkedue?: any;
};
const ChartFormField = (props: Props) => {
  const {
    fieldQuery,
    fieldType,
    fieldOptions,
    fieldLabel,
    initialValue,
    multi,
    onChange
  } = props;
  const [fieldValue, setFieldValue] = useState(initialValue);

  const onSelect = e => {
    setFieldValue(e.value);
    onChange(e);
  };

  switch (fieldQuery) {
    case 'users':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectTeamMembers
            multi={multi}
            name="chartAssignedUserIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case 'departments':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectDepartments
            multi={multi}
            name="chartAssignedDepartmentIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    case 'tags':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectTags
            tagsType="reports:reports"
            multi={multi}
            name="tags"
            label={fieldLabel}
            onSelect={onChange}
            // initialValue={fieldValue}
          />
        </div>
      );

    case 'branches':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>

          <SelectBranches
            multi={multi}
            name="chartAssignedBranchIds"
            label={fieldLabel}
            onSelect={onChange}
            initialValue={fieldValue}
          />
        </div>
      );

    default:
      break;
  }

  switch (fieldType) {
    case 'select':
      return (
        <div>
          <ControlLabel>{fieldLabel}</ControlLabel>
          <Select
            value={fieldValue}
            onChange={onSelect}
            options={fieldOptions}
            placeholder={fieldLabel}
          />
        </div>
      );

    default:
      return <></>;
  }
};

export default ChartFormField;
