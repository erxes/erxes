import {
  ControlLabel,
  DataWithLoader,
  Icon,
  Pagination,
  SelectWithSearch,
  Spinner,
  Wrapper,
  __
} from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { queries as categoryQueries } from '../categories/graphql';
import { queries as riskIndicatorQueries } from '../indicator/graphql';
import { queries as operationQueries } from '../operations/graphql';
import { FormGroupRow } from '../styles';
import {
  CustomFormGroupProps,
  OperationTypes,
  RiskAssessmentCategory,
  RiskIndicatorsType
} from './types';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import gql from 'graphql-tag';
import Select from 'react-select-plus';
import client from '@erxes/ui/src/apolloClient';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';

export const DefaultWrapper = ({
  title,
  rightActionBar,
  leftActionBar,
  loading,
  totalCount,
  content,
  sidebar,
  isPaginationHide,
  subMenu
}: {
  title: string;
  rightActionBar?: JSX.Element;
  leftActionBar?: JSX.Element;
  loading?: boolean;
  totalCount?: number;
  content: JSX.Element;
  sidebar?: JSX.Element;
  isPaginationHide?: boolean;
  subMenu: { title: string; link: string }[];
}) => {
  if (loading) {
    return <Spinner objective />;
  }
  return (
    <Wrapper
      header={<Wrapper.Header title={title} submenu={subMenu} />}
      actionBar={
        <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
      }
      content={
        <DataWithLoader
          loading={loading || false}
          data={content}
          count={totalCount}
          emptyImage="/images/actions/5.svg"
          emptyText={__('No data')}
        />
      }
      leftSidebar={sidebar}
      footer={!isPaginationHide && <Pagination count={totalCount} />}
    />
  );
};

export const CustomFormGroup = ({
  children,
  label,
  required,
  row,
  spaceBetween
}: CustomFormGroupProps) => {
  return (
    <FormGroupRow horizontal={row} spaceBetween={spaceBetween}>
      <ControlLabel required={required}>{label}</ControlLabel>
      {children}
    </FormGroupRow>
  );
};

export const subOption = category => {
  const { order } = category;
  const foundedString = order.match(/[/]/gi);
  return (
    <>
      {'\u00A0 '.repeat(foundedString.length)}
      <Icon icon="arrows-up-right" color="#3CCC38" />
    </>
  );
};

export const SelectWithCategory = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  skip,
  onSelect
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  skip?: string[];
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateCategoryOptions = (
    array: RiskAssessmentCategory[] = []
  ): IOption[] => {
    let list: any[] = [];
    for (const item of array) {
      const category = item || ({} as RiskAssessmentCategory);
      const order = category.order;
      const foundedString = order?.match(/[/]/gi);

      let space = '';
      if (foundedString) {
        space = '\u00A0 '.repeat(foundedString.length);
      }

      list.push({ label: `${space} ${category.name}`, value: category._id });
    }

    if (skip) {
      list = list.filter(item => item.value !== skip);
    }
    return list;
  };

  return (
    <SelectWithSearch
      label={label}
      queryName="riskAssesmentCategories"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateCategoryOptions}
      onSelect={onSelect}
      customQuery={categoryQueries.listAssessmentCategories}
      customOption={
        customOption ? customOption : { value: '', label: 'Choose a Category' }
      }
      multi={multi}
    />
  );
};

type SelectRiskIndicatorProps = {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  ignoreIds?: string[];
};

type SelectRiskIndicatorState = {
  options: any[];
};
export class SelectWithRiskIndicator extends React.Component<
  SelectRiskIndicatorProps,
  SelectRiskIndicatorState
> {
  constructor(props) {
    super(props);

    this.state = {
      options: []
    };

    client
      .query({
        query: gql(riskIndicatorQueries.list)
      })
      .then(({ data }) => {
        let options = data?.riskIndicators?.map(riskIndicator => ({
          value: riskIndicator._id,
          label: riskIndicator.name
        }));

        this.setState({ options });
      });
  }

  render() {
    const { label, multi, initialValue, onSelect, ignoreIds } = this.props;
    let { options } = this.state;

    if (ignoreIds) {
      const ids = ignoreIds.filter(id => id !== initialValue);
      options = options.filter(option => !ids.includes(option.value));
    }

    return (
      <Select
        placeholder={__(label)}
        options={options}
        multi={multi}
        value={initialValue}
        onChange={onSelect}
      />
    );
  }
}

type SelectCustomFieldProps = {
  label: string;
  name: string;
  initialValue: string;
  customOption?: IOption;
  onSelect: ({
    value,
    label,
    _id
  }: {
    value: any[] | string;
    label: string;
    _id: string;
  }) => void;
  type?: string;
};

type SelectCustomFieldFinalProps = {
  fields: any;
} & SelectCustomFieldProps;

class SelectCustomFieldsComponent extends React.Component<
  SelectCustomFieldFinalProps
> {
  constructor(props) {
    super(props);
  }

  render() {
    const { label, initialValue, onSelect, fields } = this.props;
    if (fields?.loading) {
      return null;
    }

    const options =
      fields?.fieldsCombinedByContentType
        .map(
          ({ _id, label, name, selectOptions }) =>
            selectOptions && {
              _id,
              label,
              name,
              value: selectOptions
            }
        )
        .filter(field => field) || [];

    const handleChange = e => {
      const _id = e?.name.replace('customFieldsData.', '');
      onSelect({ value: e?.value, label: e?.label, _id });
    };

    const defaultValue = !!initialValue
      ? options.find(
          option =>
            option.name.replace('customFieldsData.', '') === initialValue
        )
      : null;

    return (
      <Select
        placeholder={__(label)}
        value={defaultValue}
        options={[{ label: 'Select custom field', value: '' }, ...options]}
        multi={false}
        onChange={handleChange}
      />
    );
  }
}

export const SelectCustomFields = withProps<SelectCustomFieldProps>(
  compose(
    graphql<SelectCustomFieldProps>(
      gql(formQueries.fieldsCombinedByContentType),
      {
        name: 'fields',
        skip: ({ type }) => !type,
        options: ({ type }) => ({
          variables: {
            contentType: `cards:${type}`
          }
        })
      }
    )
  )(SelectCustomFieldsComponent)
);

export const SelectOperation = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  skip,
  operation,
  onSelect
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  skip?: string[];
  operation?: OperationTypes;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateOptions = (array: OperationTypes[] = []): IOption[] => {
    let list: any[] = [];
    if (operation) {
      array = array.filter(item => !item?.order?.includes(operation?.order));
    }
    for (const item of array) {
      const operation = item || ({} as OperationTypes);
      const order = operation.order;
      const foundedString = order?.match(/[/]/gi);

      let space = '';
      if (foundedString) {
        space = '\u00A0 \u00A0 '.repeat(foundedString.length);
      }

      list.push({ label: `${space} ${operation.name}`, value: operation._id });
    }

    if (skip) {
      list = list.filter(item => item.value !== skip);
    }
    return list;
  };

  return (
    <SelectWithSearch
      label={label}
      queryName="operations"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customQuery={operationQueries.operations}
      customOption={
        customOption ? customOption : { value: '', label: 'Choose a Operation' }
      }
      multi={multi}
    />
  );
};
