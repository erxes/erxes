import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert/index";
import ChartFormField from "../../components/chart/ChartFormField";
import { IFieldLogic } from "../../types";
import { getValue } from "../../utils";
import { queries } from "../../graphql";

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
  chartType: string;
  fieldValues?: any;
  setFilter: (fieldName: string, value: any) => void;
  initialValue?: any;
  // for customDate date option
  startDate?: Date;
  endDate?: Date;
};

const ChartFormFieldList = (props: Props) => {
  const { filterType, chartType, setFilter, fieldValues } = props;

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

  let queryData;
  if (fieldParentQuery && queries[`${fieldParentQuery}`]) {
    const query = useQuery(gql(queries[`${fieldParentQuery}`]), {
      variables: fieldQueryVariables ? JSON.parse(fieldQueryVariables) : {},
    });

    queryData = query && query.data ? query.data : {};
  }

  const queryExists = queries[`${fieldQuery}`];
  let logicFieldVariableExists = false;
  const logicFieldVariables = {};

  if (logics) {
    for (const logic of logics) {
      const { logicFieldName, logicFieldVariable, logicFieldExtraVariable } =
        logic;

      if (logicFieldExtraVariable) {
        Object.assign(logicFieldVariables, JSON.parse(logicFieldExtraVariable));
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
      skip: !!fieldOptions,
      variables,
    });

    const queryData = query && query.data ? query.data : {};

    queryFieldOptions =
      queryData[fieldQuery]?.map((d) => ({
        value: getValue(d, fieldValueVariable),
        label: getValue(d, fieldLabelVariable),
        ...(fieldParentVariable && {
          parent: getValue(d, fieldParentVariable),
        }),
      })) || [];
  }

  let fieldParentOptions: any = [];
  if (queryFieldOptions.length && fieldParentVariable) {
    if (fieldParentQuery && queries[fieldParentQuery]) {
      fieldParentOptions = (queryData[fieldParentQuery] || []).reduce(
        (acc, data) => {
          const options = (
            queryFieldOptions.filter((option) => option?.parent === data._id) ||
            []
          ).map(({ value, label }) => ({ value, label }));

          if (options.length > 0) {
            acc.push({ label: data.name, options });
          }

          return acc;
        },
        []
      );
    } else {
      fieldParentOptions = queryFieldOptions.reduce((acc, option) => {
        const contentType = option.parent.split(":").pop() || option.parent;
        const existingContentType = acc.find(
          (item) => item.label === contentType
        );

        if (existingContentType) {
          existingContentType.options.push({
            label: option.label.trim(),
            value: option.value,
          });
        } else {
          acc.push({
            label: contentType,
            options: [{ label: option.label.trim(), value: option.value }],
          });
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

  const selectHandler = (input) => {
    const value = input?.value || input;

    if (value !== undefined || value !== null) {
      setFilter(fieldName, value);
    }
  };

  const onChange = (input: any) => {
    switch (fieldType) {
      case "select":
        selectHandler(input);
        break;

      default:
        break;
    }
  };

  if (!checkLogic()) {
    return <></>;
  }

  // const isMulti = chartType === "table" && (fieldName === "dimension" || fieldName === "measure") ? true : multi

  return (
    <ChartFormField
      fieldType={fieldType}
      fieldQuery={fieldQuery}
      // multi={isMulti}
      multi={multi}
      fieldOptions={
        fieldOptions ||
        (fieldParentVariable ? fieldParentOptions : queryFieldOptions)
      }
      fieldLabel={fieldLabel}
      fieldDefaultValue={fieldDefaultValue}
      onChange={onChange}
      {...props}
    />
  );
};

export default ChartFormFieldList;
