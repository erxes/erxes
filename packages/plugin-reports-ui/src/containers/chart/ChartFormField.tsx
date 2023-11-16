import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
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
  multi?: boolean;
};

type Props = {
  filterType: IFilterType;
  setFilter: (fieldName: string, value: any) => void;
  filter?: IFilter;
};

// const FIELD_QUERIES_MAP = {
//   users:
// }

const ChartFormFieldList = (props: Props) => {
  const { filterType, setFilter } = props;
  const { fieldName, fieldType, fieldQuery, fieldLabel, multi } = filterType;
  const [fieldValue, setFieldValue] = useState(null);

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
          />
        </div>
      );
    default:
      break;
  }
  return <ChartFormField fieldType={fieldType} />;
};

export default ChartFormFieldList;
