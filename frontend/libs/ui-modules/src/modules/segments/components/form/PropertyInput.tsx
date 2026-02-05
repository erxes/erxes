import { gql } from '@apollo/client';
import { DatePicker, Form, Input, Select } from 'erxes-ui';
import { ControllerRenderProps, useWatch } from 'react-hook-form';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { IPropertyInput } from '../../types';
import { FieldWithError } from '../FieldWithError';
import { QuerySelectInput } from '../QuerySelectInput';

export const PropertyInput = ({
  defaultValue,
  parentFieldName,
  operators,
  selectedField,
  loading,
}: IPropertyInput) => {
  const { form } = useSegment();
  const { control } = form;
  const propertyOperator = useWatch({
    control,
    name: `${parentFieldName}.propertyOperator`,
  });

  const selectedOperator = operators.find(
    (operator) => operator.value === propertyOperator,
  );

  const { value = '', noInput } = selectedOperator || {};

  if (noInput) {
    return null;
  }

  const {
    selectOptions = [],
    selectionConfig,
    type,
    choiceOptions = [],
  } = selectedField || {};

  if (['is', 'ins', 'it', 'if'].indexOf(value) >= 0) {
    return null;
  }

  let Component = (field: ControllerRenderProps<any, any>) => (
    <Input {...field} disabled={!value || loading} />
  );

  if (['dateigt', 'dateilt', 'drlt', 'drgt'].includes(value)) {
    Component = (field: ControllerRenderProps<any, any>) => (
      <DatePicker
        className="w-full"
        value={field.value}
        onChange={(date) => field.onChange(date as Date)}
        placeholder="Select date"
        disabled={loading}
      />
    );
  }

  if (selectOptions.length > 0) {
    Component = (field: ControllerRenderProps<any, any>) => (
      <Select
        value={field.value}
        onValueChange={(selectedValue) => field.onChange(selectedValue)}
        disabled={loading}
      >
        <Select.Trigger>
          <Select.Value className="w-full" />
        </Select.Trigger>
        <Select.Content>
          {selectOptions.map((option, idx) => (
            <Select.Item key={idx} value={`${option?.value}`}>
              {option?.label || '-'}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (selectionConfig) {
    const {
      queryName,
      selectionName,
      labelField,
      valueField = '_id',
      multi,
    } = selectionConfig;
    const query = gql`
          query ${queryName}($searchValue: String,$direction: CURSOR_DIRECTION,$cursor: String,$limit:Int) {
            ${queryName}(searchValue: $searchValue,direction:$direction,cursor:$cursor,limit:$limit) {
              list{${labelField},${valueField}}
              totalCount,
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `;
    Component = (field: ControllerRenderProps<any, any>) => (
      <QuerySelectInput
        query={query}
        queryName={queryName}
        labelField={labelField}
        valueField={valueField}
        nullable
        multi
        initialValue={field.value}
        onSelect={(value) => field.onChange(value)}
        focusOnMount
      />
    );
  }

  if (type === 'radio' && choiceOptions.length > 0) {
    const options = choiceOptions.map((opt) => ({ value: opt, label: opt }));

    Component = (field: ControllerRenderProps<any, any>) => (
      <Select
        value={field.value}
        onValueChange={(selectedValue) => field.onChange(selectedValue)}
        disabled={loading}
      >
        <Select.Trigger>
          <Select.Value className="w-full" />
        </Select.Trigger>
        <Select.Content>
          {options.map((option, idx) => (
            <Select.Item key={idx} value={`${option?.value}`}>
              {option?.label || '-'}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  return (
    <Form.Field
      control={control}
      name={`${parentFieldName}.propertyValue`}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          {Component(field)}
        </FieldWithError>
      )}
    />
  );
};
