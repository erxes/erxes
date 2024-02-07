import React, { useEffect } from 'react';
import ChartFormField from '../../components/chart/ChartFormField';
import { queries } from '../../graphql';
import { gql, useQuery } from '@apollo/client';
import { IFieldLogic } from '../../types';

export type IFilterType = {
  fieldName: string;
  fieldType: string;
  fieldQuery: string;
  fieldLabel: string;
  fieldOptions: any[];
  fieldValueVariable?: string;
  fieldLabelVariable?: string;
  fieldQueryVariables?: any;
  fieldDefaultValue: any;
  multi?: boolean;
  logics?: IFieldLogic[];
};

type Props = {
  filterType: IFilterType;
  fieldValues?: any;
  setFilter: (fieldName: string, value: any) => void;
  initialValue?: any;
  // for customDate date option
  startDate?: Date;
  endDate?: Date;
};

const ChartFormFieldList = (props: Props) => {
  const { filterType, setFilter } = props;

  const {
    fieldName,
    fieldType,
    fieldQuery,
    fieldLabel,
    multi,
    fieldOptions,
    fieldValueVariable,
    fieldLabelVariable,
    fieldQueryVariables,
    fieldDefaultValue,
    logics,
  } = filterType;

  const queryExists = queries[`${fieldQuery}`];
  let queryFieldOptions;
  if (queryExists) {
    const variables = fieldQueryVariables
      ? JSON.parse(fieldQueryVariables)
      : {};

    const query = useQuery(gql(queries[`${fieldQuery}`]), {
      skip: fieldOptions ? true : false,
      variables,
    });

    const queryData = query && query.data ? query.data : {};

    queryFieldOptions =
      fieldValueVariable &&
      fieldLabelVariable &&
      queryData[fieldQuery] &&
      queryData[fieldQuery].length &&
      queryData[fieldQuery].map((d) => ({
        value: d[fieldValueVariable],
        label: d[fieldLabelVariable],
      }));
  }

  const onChange = (input: any) => {
    switch (fieldType) {
      case 'select':
        const value =
          !input.value ||
          fieldQuery?.includes('user') ||
          fieldQuery?.includes('department') ||
          fieldQuery?.includes('branch') ||
          fieldQuery?.includes('integration')
            ? input
            : input.value;
        setFilter(fieldName, value);

        return;
      default:
        return;
    }
  };

  return (
    <ChartFormField
      fieldType={fieldType}
      fieldQuery={fieldQuery}
      multi={multi}
      fieldOptions={fieldOptions ? fieldOptions : queryFieldOptions}
      fieldLogics={logics}
      fieldLabel={fieldLabel}
      fieldDefaultValue={fieldDefaultValue}
      onChange={onChange}
      {...props}
    />
  );
};

export default ChartFormFieldList;
