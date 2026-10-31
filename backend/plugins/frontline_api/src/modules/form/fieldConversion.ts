import { performance } from 'node:perf_hooks';
import type { ClientSession } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import type { IField } from './db/definitions/fields';
import {
  conversionError,
  inspectFieldConversion,
} from './inspectFieldConversion';
export { isCompatibleFormFieldValue } from './inspectFieldConversion';

const TEXT_CUSTOMER_FIELDS = [
  'core:customer:firstName',
  'core:customer:middleName',
  'core:customer:lastName',
  'core:customer:description',
  'core:customer:email',
  'core:customer:phone',
];

export const canConvertFormField = (
  source: string,
  target: string,
): boolean => {
  const [basic, customer] = source.startsWith('core:customer:')
    ? [target, source]
    : [source, target];
  return (
    (['text', 'input', 'textarea'].includes(basic) &&
      TEXT_CUSTOMER_FIELDS.includes(customer)) ||
    (basic === 'number' && customer === 'core:customer:phone') ||
    (basic === 'date' && customer === 'core:customer:birthDate')
  );
};

export interface FormFieldUpdate extends IField {
  _id: string;
  expectedType?: string;
}

export const prepareFormFieldConversions = async (
  models: IModels,
  formId: string,
  updates: FormFieldUpdate[],
  newFields: IField[],
  removedFieldIds: string[],
  session?: ClientSession,
): Promise<FormFieldUpdate[]> => {
  const fields = await models.Fields.find({
    contentType: 'form',
    contentTypeId: formId,
  })
    .read('primary')
    .session(session ?? null);
  const finalFields = [
    ...fields
      .filter((field) => !removedFieldIds.includes(field._id))
      .map((field) => ({
        ...field.toObject(),
        ...updates.find((update) => update._id === field._id),
      })),
    ...newFields,
  ];
  const conversions: FormFieldUpdate[] = [];
  for (const update of updates) {
    const field = fields.find((item) => item._id === update._id);
    if (!field)
      throw conversionError('FIELD_NOT_FOUND', 'Form field not found');
    if (update.expectedType && update.expectedType !== field.type) {
      throw conversionError(
        'STALE_FIELD',
        'The field type changed. Reload the form before converting it.',
      );
    }
    if (!update.type || field.type === update.type) continue;
    if (
      !update.expectedType &&
      !field.type?.startsWith('core:customer:') &&
      !update.type.startsWith('core:customer:')
    )
      continue;
    if (!update.expectedType || update.expectedType !== field.type) {
      throw conversionError(
        'STALE_FIELD',
        'The field type changed. Reload the form before converting it.',
      );
    }
    if (!canConvertFormField(field.type ?? '', update.type)) {
      throw conversionError(
        'UNSUPPORTED_TYPE',
        `Cannot convert "${field.text}" to this field type.`,
      );
    }
    if (field.associatedFieldId) {
      throw conversionError(
        'LINKED_FIELD',
        'Linked custom fields cannot be converted.',
      );
    }
    if (
      update.type.startsWith('core:customer:') &&
      finalFields.filter((item) => item.type === update.type).length > 1
    ) {
      throw conversionError(
        'DUPLICATE_MAPPING',
        'This customer field is already used in the form.',
      );
    }
    const allowedOperators =
      update.type === 'date' || update.type === 'core:customer:birthDate'
        ? ['dateGreaterThan', 'dateLessThan']
        : update.type === 'number'
        ? ['is', 'isNot', 'isUnknown', 'hasAnyValue', 'greaterThan', 'lessThan']
        : [
            'is',
            'isNot',
            'isUnknown',
            'hasAnyValue',
            'startsWith',
            'endsWith',
            'contains',
            'doesNotContain',
          ];
    if (
      finalFields.some((item) =>
        item.logics?.some(
          (logic) =>
            logic.fieldId === field._id &&
            logic.logicOperator &&
            !allowedOperators.includes(logic.logicOperator),
        ),
      )
    ) {
      throw conversionError(
        'CONDITIONAL_RULES',
        `Update the conditional rules using "${field.text}" before converting it.`,
      );
    }
    const targetValidator: NonNullable<IField['validator']> =
      update.validator ?? { type: 'NONE' };
    update.validation =
      update.type === 'core:customer:phone'
        ? 'phone'
        : update.type === 'core:customer:email'
        ? 'email'
        : ['date', 'core:customer:birthDate'].includes(update.type)
        ? 'date'
        : update.type === 'number'
        ? 'number'
        : '';
    update.validator = targetValidator;
    conversions.push(update);
  }
  return conversions;
};

export const validateFormFieldConversions = async (
  models: IModels,
  formId: string,
  updates: FormFieldUpdate[],
  newFields: IField[],
  removedFieldIds: string[],
  session?: ClientSession,
): Promise<void> => {
  const deadline = performance.now() + 10_000;
  const conversions = await prepareFormFieldConversions(
    models,
    formId,
    updates,
    newFields,
    removedFieldIds,
    session,
  );
  for (const update of conversions) {
    const inspection = await inspectFieldConversion(
      models,
      formId,
      update._id,
      update.type ?? '',
      update.validator,
      { stopOnInvalid: true, deadline },
    );
    if (inspection.invalidCount) {
      throw conversionError(
        'INCOMPATIBLE_ANSWERS',
        `Cannot convert "${update.text}": saved answers are incompatible. No fields were changed.`,
        { fieldId: update._id, fieldName: update.text },
      );
    }
  }
};
