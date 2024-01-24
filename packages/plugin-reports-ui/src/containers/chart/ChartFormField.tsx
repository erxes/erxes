import React from 'react';
import ChartFormField from '../../components/chart/ChartFormField';
import { queries } from '../../graphql';
import { gql, useQuery } from '@apollo/client';

type IFilter = {
  [key: string]: any;
};

export type IFilterType = {
  fieldName: string;
  fieldType: string;
  fieldQuery: string;
  fieldLabel: string;
  fieldOptions: any[];
  fieldValueVariable?: string;
  fieldLabelVariable?: string;
  multi?: boolean;
};

type Props = {
  filterType: IFilterType;
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
  } = filterType;

  const queryExists = queries[`${fieldQuery}`];
  let queryFieldOptions;

  if (queryExists) {
    const query = useQuery(gql(queries[`${fieldQuery}`]), {
      skip: fieldOptions ? true : false,
    });

    const queryData = query && query.data ? query.data : [];

    queryFieldOptions =
      fieldValueVariable &&
      fieldLabelVariable &&
      queryData.length &&
      queryData.map((d) => ({
        value: d[fieldValueVariable],
        label: d[fieldLabelVariable],
      }));
  }

  const onChange = (input: any) => {
    switch (fieldType) {
      case 'select':
        const value =
          fieldQuery &&
          (fieldQuery.includes('user') ||
            fieldQuery.includes('department') ||
            fieldQuery.includes('branch') ||
            fieldQuery.includes('integration') ||
            !input.value)
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
      fieldLabel={fieldLabel}
      onChange={onChange}
      {...props}
    />
  );
};

export default ChartFormFieldList;
