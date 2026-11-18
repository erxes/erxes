import type { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';

type TOutputVariable = {
  id?: string;
  key?: string;
  name: string;
  label?: string;
  type?: string;
  options?: { label: string; value: string }[];
  children?: TOutputVariable[];
  arrayItemSchema?: TOutputVariable[];
  arrayItemType?: string;
};

export type TOutputVariableField = {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
};

export type TSplitOperator = { value: string; labelKey: string };

const IS_SET: TSplitOperator[] = [
  { value: 'is', labelKey: 'split-operator-is-set' },
  { value: 'ins', labelKey: 'split-operator-is-not-set' },
];

const OPERATORS_BY_TYPE: Record<string, TSplitOperator[]> = {
  string: [
    { value: 'e', labelKey: 'split-operator-equals' },
    { value: 'dne', labelKey: 'split-operator-not-equals' },
    { value: 'c', labelKey: 'split-operator-contains' },
    { value: 'dnc', labelKey: 'split-operator-not-contains' },
    ...IS_SET,
  ],
  number: [
    { value: 'numbere', labelKey: 'split-operator-equals' },
    { value: 'numberdne', labelKey: 'split-operator-not-equals' },
    { value: 'numberigt', labelKey: 'split-operator-greater-than' },
    { value: 'numberilt', labelKey: 'split-operator-less-than' },
    ...IS_SET,
  ],
  boolean: [
    { value: 'it', labelKey: 'split-operator-is-true' },
    { value: 'if', labelKey: 'split-operator-is-false' },
    ...IS_SET,
  ],
  date: [
    { value: 'dateigt', labelKey: 'split-operator-greater-than' },
    { value: 'dateilt', labelKey: 'split-operator-less-than' },
    { value: 'dateis', labelKey: 'split-operator-is-set' },
    { value: 'dateins', labelKey: 'split-operator-is-not-set' },
  ],
};

// Operators that test a value's presence or truth take no value of their own
const VALUELESS_OPERATORS = ['is', 'ins', 'it', 'if', 'dateis', 'dateins'];

export const splitOperatorsOf = (type?: string) =>
  OPERATORS_BY_TYPE[type || ''] || OPERATORS_BY_TYPE.string;

export const splitOperatorTakesValue = (operator?: string) =>
  !!operator && !VALUELESS_OPERATORS.includes(operator);

const joinPath = (parentPath: string, name: string) =>
  parentPath ? `${parentPath}.${name}` : name;

const nestedVariablesOf = (variable: TOutputVariable) => {
  if (variable.type === 'object') {
    return variable.children || [];
  }

  if (variable.type === 'array' && variable.arrayItemType === 'object') {
    return variable.arrayItemSchema || [];
  }

  return null;
};

/** Every comparable leaf of the output, addressed by its dotted path. */
export const flattenOutputVariables = (
  variables: TOutputVariable[] = [],
  parentPath = '',
): TOutputVariableField[] =>
  variables.flatMap((variable) => {
    const variableName = variable.name || variable.key;

    if (!variableName) {
      return [];
    }

    const path = joinPath(parentPath, variableName);
    const nested = nestedVariablesOf(variable);

    if (nested) {
      return flattenOutputVariables(nested, path);
    }

    return [
      {
        name: path,
        label: joinPath(parentPath, variable.label || variableName),
        type: variable.type || 'string',
        options: variable.options,
      },
    ];
  });

export const normalizeOutputVariables = (
  variables: unknown,
): TOutputVariable[] =>
  Array.isArray(variables)
    ? (variables as TIncomingWebhookJSONPropertySchema[])
    : [];

export const defaultSplitCondition = (contentType: string) => ({
  propertyType: contentType,
  propertyName: '',
  propertyOperator: '',
  propertyValue: '',
});
