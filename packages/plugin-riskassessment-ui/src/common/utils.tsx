import {
  Button,
  ControlLabel,
  DataWithLoader,
  FilterByParams,
  FormControl,
  FormGroup,
  Icon,
  Pagination,
  SelectWithSearch,
  Spinner,
  Tip,
  Wrapper,
  __
} from '@erxes/ui/src';
import { IFormProps, IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { queries as categoryQueries } from '../categories/graphql';
import { queries as riskIndicatorQueries } from '../indicator/graphql';
import { queries as riskIndicatorsGroupQueries } from '../indicator/groups/graphql';
import { queries as operationQueries } from '../operations/graphql';
import { FormContainer, FormGroupRow } from '../styles';
import { CustomFormGroupProps } from './types';
import { OperationTypes } from '../operations/common/types';
import {
  RiskIndicatorsType,
  CategoryTypes,
  RiskIndicatorsListQueryResponse,
  RiskCalculateLogicType
} from '../indicator/common/types';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import gql from 'graphql-tag';
import Select from 'react-select-plus';
import client from '@erxes/ui/src/apolloClient';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { calculateMethods, COLORS } from './constants';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper
} from '@erxes/ui/src/styles/main';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

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

  const generateCategoryOptions = (array: CategoryTypes[] = []): IOption[] => {
    let list: any[] = [];
    for (const item of array) {
      const category = item || ({} as CategoryTypes);
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
export function SelectRiskIndicator({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  ignoreIds,
  onSelect,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  ignoreIds?: string[];
  filterParams?: {
    branchIds?: string[];
    departmentIds?: string[];
    operationIds?: string[];
  };
}) {
  function generetaOption(array: RiskIndicatorsType[] = []): IOption[] {
    let list: any[] = [];

    list = array.map(item => ({ value: item._id, label: item.name }));

    if (ignoreIds) {
      list = list.filter(item => !ignoreIds.includes(item.value));
    }

    return list;
  }

  return (
    <SelectWithSearch
      label={label}
      queryName="riskIndicators"
      name={name}
      initialValue={initialValue}
      generateOptions={generetaOption}
      onSelect={onSelect}
      customQuery={riskIndicatorQueries.list}
      filterParams={filterParams}
      customOption={
        customOption || !multi
          ? { value: '', label: 'Choose a Indicator' }
          : undefined
      }
      multi={multi}
    />
  );
}

export function SelectIndicatorGroups({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  ignoreIds,
  onSelect,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  ignoreIds?: string[];
  filterParams?: {
    branchIds?: string[];
    departmentIds?: string[];
    operationIds?: string[];
  };
}) {
  function generetaOption(array: RiskIndicatorsType[] = []): IOption[] {
    let list: any[] = [];

    list = array.map(item => ({ value: item._id, label: item.name }));

    if (ignoreIds) {
      list = list.filter(item => !ignoreIds.includes(item.value));
    }

    return list;
  }

  return (
    <SelectWithSearch
      label={label}
      queryName="riskIndicatorsGroups"
      name={name}
      initialValue={initialValue}
      generateOptions={generetaOption}
      onSelect={onSelect}
      customQuery={riskIndicatorsGroupQueries.list}
      filterParams={filterParams}
      customOption={
        customOption || !multi
          ? { value: '', label: 'Choose a Groups' }
          : undefined
      }
      multi={multi}
    />
  );
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

type Props = {
  formProps?: IFormProps;
  onChange: ({ calculateLogics, calculateMethod }) => void;
  calculateLogics: RiskCalculateLogicType[];
  calculateMethod: string;
};

type State = {
  calculateMethod: string;
  calculateLogics: RiskCalculateLogicType[];
};

export class CommonCalculateFields extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      calculateLogics: props.calculateLogics || [],
      calculateMethod: props.calculateMethod || ''
    };
  }

  componentDidUpdate(prevProps, prevState: Readonly<State>): void {
    if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
      this.props.onChange({ ...this.state });
    }
  }

  renderLogicRow(
    { _id, name, logic, value, value2, color }: RiskCalculateLogicType,
    formProps?: IFormProps
  ) {
    const onChange = (field, value) => {
      const { calculateLogics } = this.state;
      this.setState({
        calculateLogics: calculateLogics.map(logic =>
          logic._id === _id ? { ...logic, [field]: value } : logic
        )
      });
    };

    const onChangeColor = hex => {
      onChange('color', hex);
    };
    const onChangeRow = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      onChange(
        name,
        ['value', 'value2'].includes(name) ? parseInt(value) : value
      );
    };

    const handleRemoveRow = () => {
      const { calculateLogics } = this.state;
      this.setState({
        calculateLogics: calculateLogics.filter(logic => logic._id !== _id)
      });
    };

    const renderColorSelect = selectedColor => {
      const popoverBottom = (
        <Popover id="color-picker">
          <TwitterPicker
            width="266px"
            triangle="hide"
            color={selectedColor}
            onChange={e => onChangeColor(e.hex)}
            colors={COLORS}
          />
        </Popover>
      );

      return (
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom-start"
          overlay={popoverBottom}
        >
          <ColorPick>
            <ColorPicker style={{ backgroundColor: selectedColor }} />
          </ColorPick>
        </OverlayTrigger>
      );
    };

    return (
      <FormWrapper style={{ margin: '5px 0' }} key={_id}>
        <FormColumn>
          <FormControl
            {...formProps}
            name="name"
            type="text"
            defaultValue={name}
            onChange={onChangeRow}
            required
          />
        </FormColumn>
        <FormColumn>
          <FormControl
            name="logic"
            {...formProps}
            componentClass="select"
            required
            defaultValue={logic}
            onChange={onChangeRow}
          >
            <option />
            {['(>) greater than', '(<) lower than', '(≈) between'].map(
              value => (
                <option value={value} key={value}>
                  {value}
                </option>
              )
            )}
          </FormControl>
        </FormColumn>
        <FormColumn>
          <FormContainer row gap align="center">
            <FormControl
              {...formProps}
              name="value"
              type="number"
              defaultValue={value}
              onChange={onChangeRow}
              required
            />
            {logic === '(≈) between' && (
              <>
                <span>-</span>
                <FormControl
                  {...formProps}
                  name="value2"
                  type="number"
                  defaultValue={value2}
                  onChange={onChangeRow}
                  required
                />
              </>
            )}
          </FormContainer>
        </FormColumn>
        <FormColumn>{renderColorSelect(color)}</FormColumn>
        <Tip text="Remove Row" placement="bottom">
          <Button
            btnStyle="danger"
            icon="times"
            onClick={handleRemoveRow}
            style={{ marginLeft: '10px' }}
          />
        </Tip>
      </FormWrapper>
    );
  }

  render() {
    const { calculateMethod, calculateLogics } = this.state;
    const { formProps } = this.props;

    const handleAddLevel = () => {
      const variables = {
        _id: Math.random().toString(),
        name: '',
        value: 0,
        logic: ''
      };

      this.setState({ calculateLogics: [...calculateLogics, variables] });
    };

    const handleCalculateMethod = ({ value }) => {
      this.setState({ calculateMethod: value });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Calculate Methods')}</ControlLabel>
          <Select
            placeholder={__('Select Calculate Method')}
            value={calculateMethod}
            options={calculateMethods}
            multi={false}
            onChange={handleCalculateMethod}
          />
        </FormGroup>
        <FormWrapper>
          {['Name', 'Logic', 'Value', 'Status Color'].map(head => (
            <FormColumn key={head}>
              <ControlLabel required>{head}</ControlLabel>
            </FormColumn>
          ))}
          <Tip text="Add Level" placement="bottom">
            <Button btnStyle="default" icon="add" onClick={handleAddLevel} />
          </Tip>
        </FormWrapper>
        {calculateLogics.map(logic => this.renderLogicRow(logic, formProps))}
      </>
    );
  }
}
