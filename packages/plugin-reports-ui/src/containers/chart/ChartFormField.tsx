import React, { useState } from 'react';
import ChartFormField from '../../components/chart/ChartFormField';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { ControlLabel } from '@erxes/ui/src/components';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';

type IFilter = {
  [key: string]: any;
};

export type IFilterType = {
  fieldName: string;
  fieldType: string;
  fieldQuery: string;
  fieldLabel: string;
  fieldOptions: any[];
  multi?: boolean;
};

type Props = {
  filterType: IFilterType;
  setFilter: (fieldName: string, value: any) => void;
  initialValue?: any;
};

const ChartFormFieldList = (props: Props) => {
  const { filterType, setFilter, initialValue } = props;
  const {
    fieldName,
    fieldType,
    fieldQuery,
    fieldLabel,
    multi,
    fieldOptions
  } = filterType;
  const [fieldValue, setFieldValue] = useState(initialValue);

  const onChange = (input: any) => {
    switch (fieldType) {
      case 'select':
        const value =
          fieldQuery.includes('user') || fieldQuery.includes('department')
            ? input
            : input.value;

        setFilter(fieldName, value);
        setFieldValue(value);

        return;
      default:
        return;
    }
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
    default:
      break;
  }

  return (
    <ChartFormField
      fieldType={fieldType}
      fieldOptions={fieldOptions}
      fieldLabel={fieldLabel}
    />
  );
};

export default ChartFormFieldList;
