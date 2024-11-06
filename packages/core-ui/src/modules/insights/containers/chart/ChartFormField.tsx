import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

import ChartFormField from "../../components/chart/ChartFormField";
import { IFieldLogic } from "../../types";
import { compareValues, generateOptions, generateQuery, generateSubOptions, getVariables } from "../../utils";

export type IFilterType = {
  fieldName: string;
  fieldType: string;
  fieldQuery: string;
  fieldLabel: string;
  fieldOptions: any[];
  fieldAttributes: any[]
  fieldValueVariable?: string;
  fieldLabelVariable?: string;
  fieldParentVariable?: string;
  fieldParentQuery?: string;
  fieldQueryVariables?: any;
  fieldDefaultValue: any;
  multi?: boolean;
  logics?: IFieldLogic[];
  fieldValueOptions?: any[];
  fieldExtraVariables?: string[];
};

type FinalProps = {
  parentData: any[]
} & Props


const ChartFormFieldContainer = (props: FinalProps) => {

  const { filterType, parentData, setFilter, setFilters, fieldValues } = props;

  const {
    fieldName,
    fieldType,
    fieldQuery,
    fieldLabel,
    multi,
    fieldOptions,
    fieldAttributes,
    fieldDefaultValue,
    logics,
    fieldValueOptions
  } = filterType;

  const [data, setData] = useState([])
  const [options, setOptions] = useState(fieldOptions || [])

  const query = generateQuery(fieldQuery, filterType, fieldValues)

  if (!fieldOptions?.length && query) {
    const variables = getVariables(fieldValues, filterType)

    const { data: queryData, loading } = useQuery(gql(query), {
      skip: !!fieldOptions,
      variables: variables
    });

    useEffect(() => {
      if (!loading) {
        setData(queryData?.[fieldQuery] || [])
      }
    }, [queryData])
  }

  useEffect(() => {

    if (!fieldOptions) {
      const generatedOptions = generateOptions(data, parentData, filterType)

      setOptions(generatedOptions);
    }

  }, [data, parentData])

  const checkLogic = () => {
    if (!logics) {
      return false;
    }

    for (const logic of logics) {
      const { logicFieldName, logicFieldValue, logicFieldVariable, logicFieldOperator } = logic;

      if (props.hasOwnProperty(logicFieldName) && props[logicFieldName]) {

        const propValue = props[logicFieldName]

        const isValid = compareValues(propValue, logicFieldValue, logicFieldOperator || 'eq')

        if (isValid) {
          return false
        }
      }

      if (fieldValues.hasOwnProperty(logicFieldName) && fieldValues[logicFieldName]) {

        const isArray = Array.isArray(fieldValues[logicFieldName])

        if (logicFieldVariable) {
          return false
        }

        if (isArray && !fieldValues[logicFieldName].some(value => logicFieldValue.includes(value))) {
          return true;
        }
        return false;
      }

      // delete fieldValues[fieldName]
    }
    return true
  };

  const onChange = (input: any, name?: string) => {
    const value = input?.value || input;

    if (value !== undefined || value !== null) {
      if (name) {
        setFilter(name, value);
      } else {
        setFilter(fieldName, value);
      }
    }
  };

  if (checkLogic()) {
    return <></>;
  }

  return (
    <ChartFormField
      fieldType={fieldType}
      fieldQuery={fieldQuery}
      multi={multi}
      fieldOptions={options}
      subOptions={generateSubOptions(data, fieldValues, filterType) || []}
      fieldLogics={logics}
      fieldLabel={fieldLabel}
      fieldAttributes={fieldAttributes}
      fieldDefaultValue={fieldDefaultValue}
      fieldValueOptions={fieldValueOptions}
      onChange={onChange}
      {...props}
    />
  )
}

type Props = {
  filterType: IFilterType;
  chartType: string;
  fieldValues?: any;
  setFilter: (fieldName: string, value: any) => void;
  setFilters: (fieldValues: any) => void;
  initialValue?: any;
  startDate?: Date;
  endDate?: Date;
};

const ChartFormFieldWrapper = (props: Props) => {

  const { filterType } = props;

  const {
    fieldParentQuery,
    fieldQueryVariables,
  } = filterType;

  const [parentData, setParentData] = useState([])

  const query = generateQuery(fieldParentQuery, filterType)

  if (fieldParentQuery && query) {

    const { data: queryData, loading } = useQuery(gql(query), {
      variables: fieldQueryVariables ? JSON.parse(fieldQueryVariables) : {}
    });

    useEffect(() => {
      if (!loading && queryData) {
        setParentData(queryData[fieldParentQuery] || [])
      }
    }, [loading])
  }

  const finalProps = {
    ...props,
    parentData
  }

  return (
    <ChartFormFieldContainer {...finalProps} />
  )
}

export default ChartFormFieldWrapper