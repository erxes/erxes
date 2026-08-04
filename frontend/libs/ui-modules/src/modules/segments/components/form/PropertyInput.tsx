import { gql } from '@apollo/client';
import { DatePicker, Form, Input, Select, TPropertyInputMeta } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useWatch,
} from 'react-hook-form';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentGroupField } from '../../context/SegmentGroupField';
import { FieldWithError } from '../FieldWithError';
import { QuerySelectInput } from '../QuerySelectInput';
import { pluginsConfigState } from 'ui-modules/states';
import { TSegmentForm } from '../../types';

const isPropertyInputMeta = (value: unknown): value is TPropertyInputMeta =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

type PropertyValueField = ControllerRenderProps<FieldValues, string>;

export const PropertyInput = () => {
  const { form } = useSegment();
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const {
    condition,
    conditionFieldName,
    operators = [],
    selectedField,
    loading,
    onBeforeFieldChange,
  } = useSegmentGroupField();
  const propertyOperator = useWatch({
    control: form.control,
    name: `${conditionFieldName}.propertyOperator`,
  });

  const selectedOperator = operators.find(
    (operator) => operator.value === propertyOperator,
  );

  const { value = '', noInput } = selectedOperator || {};

  if (noInput) {
    return null;
  }

  const {
    options = [],
    configs,
    selectionConfig,
    // choiceOptions = [],
  } = selectedField || {};

  const [pluginName] = condition?.propertyType?.split(':') || [];
  const customInputName = selectionConfig?.component;
  const CustomInput =
    pluginName && customInputName
      ? Object.values(pluginsConfig || {}).find(
          (pluginConfig) => pluginConfig.name === pluginName,
        )?.widgets?.propertyInputs?.[customInputName]
      : undefined;

  if (['is', 'ins', 'it', 'if'].indexOf(value) >= 0) {
    return null;
  }

  let Component = (field: PropertyValueField) => (
    <Input {...field} className="w-full min-w-0" disabled={!value || loading} />
  );

  if (['dateigt', 'dateilt', 'drlt', 'drgt'].includes(value)) {
    Component = (field: PropertyValueField) => (
      <DatePicker
        className="w-full"
        value={field.value}
        onChange={(date) => field.onChange(date as Date)}
        placeholder="Select date"
        disabled={loading}
      />
    );
  }

  if (options.length > 0) {
    Component = (field: PropertyValueField) => (
      <Select
        value={field.value}
        onValueChange={(selectedValue) => field.onChange(selectedValue)}
        disabled={loading}
      >
        <Select.Trigger className="w-full min-w-0">
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

  if (configs?.queryName && configs?.labelField) {
    const { queryName, labelField, valueField = '_id', multi } = configs;
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
    Component = (field: PropertyValueField) => (
      <QuerySelectInput
        query={query}
        queryName={queryName}
        labelField={labelField}
        valueField={valueField}
        nullable
        multi={multi}
        value={field.value}
        onSelect={(value) => {
          field.onChange(value);
        }}
        focusOnMount
      />
    );
  }

  if (CustomInput) {
    Component = (field: PropertyValueField) => (
      <CustomInput
        value={typeof field.value === 'string' ? field.value : ''}
        onValueChange={field.onChange}
        meta={isPropertyInputMeta(condition?.meta) ? condition.meta : {}}
        onMetaChange={(meta) => {
          form.setValue(
            `${conditionFieldName}.meta` as Path<TSegmentForm>,
            meta,
            { shouldDirty: true },
          );
        }}
        disabled={!value || loading}
      />
    );
  }

  const wrapFieldOnChange = (field: PropertyValueField) => ({
    ...field,
    onChange: (updatedValue: unknown) => {
      onBeforeFieldChange('propertyValue');
      field.onChange(updatedValue);
    },
  });

  return (
    <Form.Field
      control={form.control}
      name={`${conditionFieldName}.propertyValue`}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          <div className="w-full min-w-0">
            {Component(wrapFieldOnChange(field))}
          </div>
        </FieldWithError>
      )}
    />
  );
};
