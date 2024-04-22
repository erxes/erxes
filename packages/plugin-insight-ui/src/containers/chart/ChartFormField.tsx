import React, { useEffect } from 'react';

import Alert from '@erxes/ui/src/utils/Alert/index';
import { gql, useQuery } from '@apollo/client';

import ChartFormField from '../../components/chart/ChartFormField';
import { queries } from '../../graphql';
import { IFieldLogic } from '../../types';
import { getValue } from '../../utils';

export type IFilterType = {
  fieldName: string;
  fieldType: string;
  fieldQuery: string;
  fieldLabel: string;
  fieldOptions: any[];
  fieldValueVariable?: string;
  fieldLabelVariable?: string;
  fieldParentVariable?: string;
  fieldParentQuery?: string;
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
  const { filterType, setFilter, fieldValues } = props;

  const {
    fieldName,
    fieldType,
    fieldQuery,
    fieldLabel,
    multi,
    fieldOptions,
    fieldValueVariable,
    fieldLabelVariable,
    fieldParentVariable,
    fieldParentQuery,
    fieldQueryVariables,
    fieldDefaultValue,
    logics,
  } = filterType;

  let queryData
  if (fieldParentQuery && queries[`${fieldParentQuery}`]) {
    const query = useQuery(gql(queries[`${fieldParentQuery}`]), {
      variables: fieldQueryVariables
        ? JSON.parse(fieldQueryVariables)
        : {}
    });

    queryData = query && query.data ? query.data : {};
  }

  const queryExists = queries[`${fieldQuery}`];
  let logicFieldVariableExists = false;
  const logicFieldVariables = {};

  if (logics) {
    for (const logic of logics) {
      const { logicFieldName, logicFieldVariable, logicFieldExtraVariable } = logic;

      if (logicFieldExtraVariable) {
        Object.assign(logicFieldVariables, JSON.parse(logicFieldExtraVariable))
      }

      if (logicFieldVariable) {
        const logicFieldValue = fieldValues[logicFieldName];
        if (logicFieldValue) {
          logicFieldVariables[logicFieldVariable] = logicFieldValue;
          logicFieldVariableExists = true;
        }
      }
    }
  }

  let queryFieldOptions: any = [];

  if (queryExists) {
    const variables = logicFieldVariableExists
      ? logicFieldVariables
      : fieldQueryVariables
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
      queryData[fieldQuery].length
        ? queryData[fieldQuery].map((d) => ({
          value: getValue(d, fieldValueVariable),
          label: getValue(d, fieldLabelVariable),
            ...(fieldParentVariable && { parent: d[fieldParentVariable] }),
          }))
        : [];
  }

  let fieldParentOptions: any = [];
  if (queryFieldOptions.length && fieldParentVariable) {

    if (fieldParentQuery && queries[fieldParentQuery]) {
      fieldParentOptions = (queryData[fieldParentQuery] || []).reduce((acc, data) => {
        const options = queryFieldOptions
          .filter((option) => option?.parent === data._id)
          .map(({ value, label }) => ({ value, label }));

        if (options.length > 0) {
          acc.push({ label: data.name, options });
        }

        return acc;
      }, []);
    } else {
      fieldParentOptions = queryFieldOptions.reduce((acc, option) => {
        const contentType = option.parent.split(":").pop() || option.parent;
        const existingContentType = acc.find(item => item.label === contentType);

        if (existingContentType) {
          existingContentType.options.push({ label: option.label.trim(), value: option.value });
        } else {
          acc.push({ label: contentType, options: [{ label: option.label.trim(), value: option.value }] });
        }

        return acc;
      }, []);
    }
  }

  const checkLogic = () => {
    if (!logics) {
      return true;
    }

    for (const logic of logics) {
      const { logicFieldName, logicFieldValue } = logic;
      if (!fieldValues[logicFieldName]) {
        return false;
      }

      if (
        !logicFieldVariableExists &&
        fieldValues[logicFieldName] !== logicFieldValue
      ) {
        return false;
      }
    }

    return true;
  };
  const onChange = (input: any) => {
    switch (fieldType) {
      case 'select':
        const value =
          input.value !== undefined || input.value !== null ||
          fieldQuery?.includes('user') ||
          fieldQuery?.includes('department') ||
          fieldQuery?.includes('branch') ||
          fieldQuery?.includes('integration')
            ? input
            : input.value;
        setFilter(fieldName, value);
        break;

      case 'groups':
        if (Array.isArray(input)) {
          setFilter(fieldName, input);
        }
        break;

      default:
        break;
    }
  };

  if (!checkLogic()) {
    return <></>;
  }
  return (
    <ChartFormField
      fieldType={fieldType}
      fieldQuery={fieldQuery}
      multi={multi}
      fieldOptions={
        fieldOptions
          ? fieldOptions
          : fieldParentVariable
            ? fieldParentOptions
            : queryFieldOptions
      }
      fieldLogics={logics}
      fieldLabel={fieldLabel}
      fieldDefaultValue={fieldDefaultValue}
      onChange={onChange}
      {...props}
    />
  );
};

export default ChartFormFieldList;
