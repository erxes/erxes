import { TAutomationOutputVariable } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { TAutomationField } from 'ui-modules';

// What a condition can test, and which input its value needs
export type TConditionValueKind =
  | 'options'
  | 'component'
  | 'boolean'
  | 'number'
  | 'date'
  | 'text';

export type TConditionProperty = {
  token: string;
  label: string;
  valueKind: TConditionValueKind;
  options?: { label: string; value: string }[];
  field?: TAutomationField;
  propertyType?: string;
};

export const CONDITION_OPERATORS: Record<
  TConditionValueKind,
  { value: string; label: string }[]
> = {
  options: [
    { value: 'e', label: 'is' },
    { value: 'dne', label: 'is not' },
    { value: 'is', label: 'is set' },
    { value: 'ins', label: 'is not set' },
  ],
  component: [
    { value: 'e', label: 'is' },
    { value: 'dne', label: 'is not' },
    { value: 'is', label: 'is set' },
    { value: 'ins', label: 'is not set' },
  ],
  boolean: [
    { value: 'it', label: 'is true' },
    { value: 'if', label: 'is false' },
  ],
  number: [
    { value: 'numbere', label: 'equals' },
    { value: 'numberdne', label: 'does not equal' },
    { value: 'numberigt', label: 'is at least' },
    { value: 'numberilt', label: 'is at most' },
    { value: 'is', label: 'is set' },
    { value: 'ins', label: 'is not set' },
  ],
  date: [
    { value: 'dateigt', label: 'is after' },
    { value: 'dateilt', label: 'is before' },
    { value: 'dateis', label: 'is set' },
    { value: 'dateins', label: 'is not set' },
  ],
  text: [
    { value: 'e', label: 'equals' },
    { value: 'dne', label: 'does not equal' },
    { value: 'c', label: 'contains' },
    { value: 'dnc', label: 'does not contain' },
    { value: 'is', label: 'is set' },
    { value: 'ins', label: 'is not set' },
  ],
};

const kindOfType = (type?: string): TConditionValueKind => {
  switch ((type || '').toLowerCase()) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
};

/** Output variables, one level of their sub-fields included. */
export const toVariableProperties = (
  variables: TAutomationOutputVariable[],
  tokenOf: (path: string) => string,
): TConditionProperty[] =>
  variables.flatMap((variable) => {
    const children = [
      ...(variable.fields || []),
      ...(variable.referenceFields || []),
    ];
    const own: TConditionProperty = {
      token: tokenOf(variable.key),
      label: variable.label,
      valueKind: variable.options?.length
        ? 'options'
        : kindOfType(variable.type),
      options: variable.options,
    };

    return [
      own,
      ...children.map((child) => ({
        token: tokenOf(`${variable.key}.${child.key}`),
        label: `${variable.label} · ${child.label}`,
        valueKind: child.options?.length
          ? ('options' as const)
          : kindOfType(child.type),
        options: child.options,
      })),
    ];
  });

/** A record's own fields, read the way Manage properties reads them. */
export const toFieldProperties = (
  fields: TAutomationField[],
  propertyType: string,
  tokenOf: (path: string) => string,
): TConditionProperty[] =>
  fields
    .filter((field) => field.name)
    .map((field) => ({
      token: tokenOf(field.name),
      label: field.label || field.name,
      field,
      propertyType,
      valueKind: field.selectionConfig?.component
        ? 'component'
        : field.selectOptions?.length
        ? 'options'
        : kindOfType(field.type),
      options: field.selectOptions?.map(({ label, value }) => ({
        label,
        value: String(value),
      })),
    }));
