import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { segmentFormSchema } from '../states/segmentFormSchema';
import {
  IConditionsForPreview,
  IField,
  IOperator,
  TSegmentForm,
} from '../types';

import { Path } from 'react-hook-form';
import { OPERATORS } from '../constants';
import { DEFAULT_OPERATORS } from '../constants';
import { nanoid } from 'nanoid';

export function startCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // handle camelCase
    .replace(/[_-]+/g, ' ') // handle snake_case and kebab-case
    .toLowerCase() // make everything lowercase first
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
}

export const groupFieldsByType = (fields: IField[]) => {
  return fields.reduce((acc: Record<string, Array<IField>>, field) => {
    const { value } = field || {};
    let key;

    if (field.group) {
      key = field.group;
    } else {
      key = value?.includes('.')
        ? value.substr(0, value.indexOf('.'))
        : 'general';

      key = startCase(key);
    }

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(field);

    return acc;
  }, {});
};

type FieldPath = string | number;

export function createFieldNameSafe<T>(
  basePath?: string,
  ...pathParts: FieldPath[]
): Path<T> {
  return [basePath || '', ...pathParts]
    .filter((path) => ![undefined, null, ''].includes(String(path)))
    .join('.') as Path<T>;
}

export const generateParamsSegmentPreviewCount = (
  form: UseFormReturn<z.infer<typeof segmentFormSchema>>,
  selectedContentType: string,
) => {
  const conditions = form.watch('conditions');
  const conditionSegments = form.watch('conditionSegments');
  const conditionsConjunction = form.watch('conditionsConjunction');

  const conditionsForPreview: IConditionsForPreview[] = [];

  if (conditions?.length) {
    conditionsForPreview.push({
      type: 'subSegment',
      subSegmentForPreview: {
        key: nanoid(),
        contentType: selectedContentType || '',
        conditionsConjunction,
        conditions: conditions,
      },
    });
  }

  if (conditionSegments?.length) {
    conditionSegments.forEach((segment) => {
      conditionsForPreview.push({
        type: 'subSegment',
        subSegmentForPreview: {
          key: nanoid(),
          ...segment,
          conditions: segment.conditions || [],
        },
      });
    });
  }

  return conditionsForPreview;
};

export const getSegmentFormDefaultValues = (
  propertyType: string,
  segment: any,
) => {
  const {
    subSegmentConditions = [],
    conditions = [],
    name,
    description,
    config,
    conditionsConjunction,
    subOf,
    getSubSegments,
  } = segment;

  const values: TSegmentForm = {
    name: name || '',
    description: description || '',
    config: config || {},
    conditionsConjunction: conditionsConjunction || 'or',
    subOf: subOf || '',
  };

  if (subSegmentConditions.length) {
    values.conditionSegments = subSegmentConditions;
  } else if (conditions.length) {
    values.conditions = conditions;
  } else {
    values.conditions = [
      { propertyType, propertyName: '', propertyOperator: '' },
    ];
  }

  return values;
};

export const getSelectedFieldConfig = (
  fieldName: string,
  fields: IField[],
): { selectedField: IField; operators: IOperator[] } | undefined => {
  if (!fieldName) {
    return;
  }

  const selectedField = fields.find((field) => field.name === fieldName);

  if (!selectedField) {
    return undefined;
  }

  const { type, validation } = selectedField || {};

  const operatorType = (type || validation || '').toLowerCase() as
    | 'string'
    | 'boolean'
    | 'number'
    | 'date';

  const operators = OPERATORS[operatorType] || DEFAULT_OPERATORS;

  return { selectedField, operators };
};
