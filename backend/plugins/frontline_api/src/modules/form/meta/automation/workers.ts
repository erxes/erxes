import {
  AUTOMATION_UNARY_OPERATORS,
  isAutomationConditionMatched,
  sendAutomationTrigger,
} from 'erxes-api-shared/core-modules';
import type {
  TAutomationOutputVariable,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';
import type { IField } from '@/form/db/definitions/fields';
import {
  FORM_ANSWERS_KEY,
  FORM_SUBMISSION_COLLECTION,
  FORM_SUBMITTED_TRIGGER_TYPE,
} from './constants';
import type {
  TFormFieldCondition,
  TFormSubmittedTriggerConfig,
  TFormSubmittedTriggerTarget,
} from './types';

// Negative operators must hold for every picked option, the rest for any
const NEGATIVE_OPERATORS = ['dne', 'numberdne', 'dnc'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toConditions = (value: unknown): TFormFieldCondition[] =>
  Array.isArray(value)
    ? value.filter(
        (condition): condition is TFormFieldCondition =>
          isRecord(condition) &&
          typeof condition.fieldId === 'string' &&
          !!condition.fieldId &&
          typeof condition.operator === 'string' &&
          !!condition.operator,
      )
    : [];

// Widget values may arrive as numbers or booleans; the rule value is text
const toComparable = (value: unknown) =>
  typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : value;

const isFieldConditionMatched = (
  actualValue: unknown,
  { operator, value }: TFormFieldCondition,
) => {
  if (AUTOMATION_UNARY_OPERATORS.includes(operator)) {
    return isAutomationConditionMatched(actualValue, operator, value);
  }

  const matches = (item: unknown) =>
    isAutomationConditionMatched(toComparable(item), operator, value);

  if (!Array.isArray(actualValue)) {
    return matches(actualValue);
  }

  return NEGATIVE_OPERATORS.includes(operator)
    ? actualValue.every(matches)
    : actualValue.some(matches);
};

export const isFormSubmittedTriggerMatched = (
  target: TFormSubmittedTriggerTarget | undefined,
  config: TFormSubmittedTriggerConfig | undefined,
) => {
  if (!target || !config?.formId || target.formId !== config.formId) {
    return false;
  }

  const conditions = toConditions(config.conditions);

  if (!conditions.length) {
    return true;
  }

  const fieldValues = isRecord(target.fieldValues) ? target.fieldValues : {};
  const matches = (condition: TFormFieldCondition) =>
    isFieldConditionMatched(fieldValues[condition.fieldId], condition);

  return config.conjunction === 'or'
    ? conditions.some(matches)
    : conditions.every(matches);
};

const toVariableType = ({ type, validation }: Pick<IField, 'type' | 'validation'>) => {
  if (type === 'number' || validation === 'number') {
    return 'number';
  }

  if (
    type === 'date' ||
    type === 'core:customer:birthDate' ||
    validation === 'date' ||
    validation === 'datetime'
  ) {
    return 'date';
  }

  return type === 'boolean' ? 'boolean' : 'string';
};

// One variable per field of the chosen form, read as fieldValues.<fieldId>
export const getFormAnswerVariables = async (
  models: IModels,
  formId: string,
): Promise<TAutomationOutputVariable[]> => {
  const fields = await models.Fields.find({
    contentType: 'form',
    contentTypeId: formId,
  })
    .sort({ order: 1 })
    .lean();

  if (!fields.length) {
    return [];
  }

  return [
    {
      key: FORM_ANSWERS_KEY,
      label: 'Form answers',
      fields: fields.map((formField) => ({
        key: formField._id,
        label: formField.text || formField.type || formField._id,
        type: toVariableType(formField),
        ...(formField.options?.length
          ? {
              options: formField.options.map((option) => ({
                label: option,
                value: option,
              })),
            }
          : {}),
      })),
    },
  ];
};

export const sendFormSubmittedTrigger = (
  subdomain: string,
  target: TFormSubmittedTriggerTarget,
) => {
  sendAutomationTrigger(subdomain, {
    type: FORM_SUBMITTED_TRIGGER_TYPE,
    targets: [target],
  });
};

export const formAutomationWorkers = {
  checkCustomTrigger: ({
    collectionType,
    target,
    config,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) => {
    if (collectionType !== FORM_SUBMISSION_COLLECTION) {
      return false;
    }

    return isFormSubmittedTriggerMatched(
      target as TFormSubmittedTriggerTarget | undefined,
      config as TFormSubmittedTriggerConfig | undefined,
    );
  },

  resolveOutputVariables: async (
    {
      collectionType,
      config,
    }: TAutomationProducersInput[TAutomationProducers.RESOLVE_OUTPUT_VARIABLES],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { formId } = config as TFormSubmittedTriggerConfig;

    if (collectionType !== FORM_SUBMISSION_COLLECTION || !formId) {
      return [];
    }

    return await getFormAnswerVariables(models, formId);
  },
};
