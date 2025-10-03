import { gql } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { ControllerRenderProps } from 'react-hook-form';
import { Button, cn, DatePicker, Form, Input, Select, Spinner } from 'erxes-ui';

import { getFieldsProperties } from '../../hooks';
import {
  IProperty,
  IPropertyCondtion,
  IPropertyField,
  IPropertyInput,
} from '../../types';
import {
  createFieldNameSafe,
  getSelectedFieldConfig,
  groupFieldsByType,
} from '../../utils/segmentFormUtils';
import { FieldWithError } from '../FieldWithError';
import { QuerySelectInput } from '../QuerySelectInput';

const PropertyField = ({
  form,
  fields,
  parentFieldName,
  defaultValue,
  propertyTypes,
  contentType,
}: IPropertyField) => {
  const { control } = form;
  const groups = groupFieldsByType(fields);
  return (
    <div className="flex flex-row w-full">
      <Form.Field
        control={control}
        name={`${parentFieldName}.propertyType`}
        defaultValue={contentType || undefined}
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <Select.Trigger className="w-2/6 rounded-l-lg border-r-none">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {propertyTypes.map(
                  ({ value, description }: any, index: number) => (
                    <Select.Item key={index} value={value}>
                      {description}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select>
          </FieldWithError>
        )}
      />
      <Form.Field
        control={control}
        name={`${parentFieldName}.propertyName`}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <Select.Trigger className="w-4/6 rounded-r-lg border-l-none">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {Object.keys(groups).map((key, index) => {
                  let groupName = key;
                  const groupDetail = (groups[key] || []).find(
                    ({ group }: any) => group === key,
                  )?.groupDetail;

                  if (groupDetail) {
                    groupName = groupDetail?.name || key;
                  }
                  return (
                    <div key={index}>
                      <Select.Group>
                        <Select.Label>{groupName}</Select.Label>
                        {groups[key].map(
                          ({ name, label }: any, index: number) => (
                            <Select.Item key={index} value={name}>
                              {label}
                            </Select.Item>
                          ),
                        )}
                      </Select.Group>
                      <Select.Separator />
                    </div>
                  );
                })}
              </Select.Content>
            </Select>
          </FieldWithError>
        )}
      />
    </div>
  );
};

const PropertyOperator = ({
  index,
  form,
  currentField,
  operators,
  parentFieldName,
  defaultValue,
}: IPropertyCondtion) => {
  const { control } = form;

  return (
    <Form.Field
      control={control}
      name={`${parentFieldName}.propertyOperator`}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          <Select
            defaultValue={field?.value}
            disabled={!currentField}
            onValueChange={(selectedValue) => field.onChange(selectedValue)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select an operator" />
            </Select.Trigger>
            <Select.Content>
              {operators.map((operator, i) => (
                <Select.Item value={operator.value}>
                  {operator.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </FieldWithError>
      )}
    />
  );
};

const PropertyInput = ({
  index,
  form,
  defaultValue,
  parentFieldName,
  operators,
  selectedField,
}: IPropertyInput) => {
  const { control, watch, getValues } = form;
  const propertyOperator = watch(`${parentFieldName}.propertyOperator`);
  const propertyName = getValues(`${parentFieldName}.propertyName`);

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
    <Input {...field} disabled={!value} />
  );

  if (['dateigt', 'dateilt', 'drlt', 'drgt'].includes(value)) {
    Component = (field: ControllerRenderProps<any, any>) => (
      <DatePicker
        className="w-full"
        value={field.value}
        onChange={(date) => field.onChange(date as Date)}
        placeholder="Select date"
      />
    );
  }

  if (selectOptions.length > 0) {
    Component = (field: ControllerRenderProps<any, any>) => (
      <Select
        defaultValue={field?.value}
        onValueChange={(selectedValue) => field.onChange(selectedValue)}
      >
        <Select.Trigger>
          <Select.Value className="w-full" />
        </Select.Trigger>
        <Select.Content>
          {selectOptions.map((option) => (
            <Select.Item value={`${option?.value}`}>
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
        defaultValue={field?.value}
        onValueChange={(selectedValue) => field.onChange(selectedValue)}
      >
        <Select.Trigger>
          <Select.Value className="w-full" />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item value={`${option?.value}`}>
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
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          {Component(field)}
        </FieldWithError>
      )}
    />
  );
};

export const SegmentProperty = ({
  form,
  index,
  condition,
  remove,
  isFirst,
  isLast,
  total,
  parentFieldName,
  contentType,
}: IProperty) => {
  const { watch, setValue } = form;

  const fieldName = createFieldNameSafe(parentFieldName, 'conditions', index);
  const propertyType = watch(`${fieldName}.propertyType` as any);
  const { fields, propertyTypes, loading } = getFieldsProperties(propertyType);

  if (loading) {
    return <Spinner />;
  }

  const { selectedField, operators } =
    getSelectedFieldConfig(watch(`${fieldName}.propertyName` as any), fields) ||
    {};

  const renderAndOrBtn = () => {
    const hasTwoElement = total === 2;
    const isOdd = Math.round(total) % 2 === 0;
    const middleIndex = Math.round(total / 2) + (isOdd ? 1 : 0);

    if (middleIndex === index + 1 || (hasTwoElement && index === 1)) {
      const field:
        | `conditionSegments.${number}.conditionsConjunction`
        | 'conditionsConjunction' = parentFieldName
        ? `${parentFieldName}.conditionsConjunction`
        : `conditionsConjunction`;
      const value = watch(field);
      const handleClick = () => {
        setValue(field, value === 'or' ? 'and' : 'or');
      };
      return (
        <div
          className={cn(
            'absolute z-10 -left-1 cursor-pointer hover:bg-amber-200 text-amber-600/50 w-12 h-6 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium transition',
            {
              '-top-3': isOdd,
              'bg-green-100 text-green-600 hover:bg-green-100 hover:text-green-600/50':
                value === 'and',
            },
          )}
          onClick={handleClick}
        >
          {(value || '')?.toUpperCase() || 'OR'}
        </div>
      );
    }
  };

  return (
    <div className="flex items-center relative" key={index}>
      {/* Tree line connector */}
      {total > 1 && (
        <div className="absolute left-0 flex items-center h-full">
          {/* Vertical line */}
          {!isFirst && (
            <div className="absolute top-0 left-[24px] w-[1px] h-1/2 bg-gray-300"></div>
          )}
          {!isLast && (
            <div className="absolute bottom-0 left-[24px] w-[1px] h-1/2 bg-gray-300"></div>
          )}

          {/* Horizontal line */}
          <div className="absolute left-[24px] w-[20px] h-[1px] bg-gray-300"></div>

          {/* OR label (only on second item) */}
          {renderAndOrBtn()}
        </div>
      )}

      <div
        className={`flex flex-row gap-4 w-full py-2 group ${
          total > 1 ? 'pl-12' : ''
        }`}
      >
        <div className="w-2/5">
          <PropertyField
            form={form}
            contentType={contentType}
            defaultValue={condition.propertyName}
            parentFieldName={fieldName}
            index={index}
            fields={fields}
            currentField={selectedField}
            propertyTypes={propertyTypes}
          />
        </div>
        <div className="w-1/5">
          <PropertyOperator
            form={form}
            defaultValue={condition.propertyOperator}
            parentFieldName={fieldName}
            index={index}
            currentField={selectedField}
            operators={operators || []}
          />
        </div>
        <div className="w-2/5 flex items-center gap-2">
          <PropertyInput
            form={form}
            defaultValue={condition.propertyValue}
            parentFieldName={fieldName}
            index={index}
            operators={operators || []}
            selectedField={selectedField}
          />
          <Button
            variant="destructive"
            size="icon"
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => remove()}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
