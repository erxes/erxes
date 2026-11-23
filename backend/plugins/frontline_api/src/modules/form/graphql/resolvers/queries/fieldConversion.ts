import type { IContext } from '~/connectionResolvers';
import { requireFormTransactions } from '../../../formWriteGuard';
import type { IField } from '../../../db/definitions/fields';
import { performance } from 'node:perf_hooks';
import { countCustomerBackfill } from '../../../customerBackfill';
import { prepareFormFieldConversions } from '../../../fieldConversion';
import {
  conversionError,
  inspectFieldConversion,
  type ConversionInspection,
} from '../../../inspectFieldConversion';

export interface ConversionCheckArgs {
  formId: string;
  fieldId: string;
  expectedType: string;
  targetType: string;
  validator?: IField['validator'];
  draftFields: (IField & { _id: string; expectedType?: string })[];
  page?: number;
  search?: string;
}

export const fieldConversionQueries = {
  async frontlineFormFieldConversionCheck(
    _root: unknown,
    args: ConversionCheckArgs,
    { models, user, checkPermission, subdomain }: IContext,
  ): Promise<
    ConversionInspection & {
      customersToFill: number | null;
      customersKept: number | null;
    }
  > {
    if (!user?._id) throw new Error('Unauthorized');
    await checkPermission('formsEdit');
    await requireFormTransactions(models);
    const savedFields = await models.Fields.find({
      contentType: 'form',
      contentTypeId: args.formId,
    })
      .select('_id')
      .lean();
    const savedIds = new Set(savedFields.map((field) => field._id));
    if (
      !savedIds.has(args.fieldId) ||
      !args.draftFields.some((field) => field._id === args.fieldId)
    ) {
      throw conversionError('FIELD_NOT_FOUND', 'Form field not found');
    }
    const updates = args.draftFields
      .filter((field) => savedIds.has(field._id))
      .map((field) =>
        field._id === args.fieldId
          ? {
              ...field,
              type: args.targetType,
              expectedType: args.expectedType,
              validator: args.validator,
            }
          : field,
      );
    const conversions = await prepareFormFieldConversions(
      models,
      args.formId,
      updates,
      args.draftFields.filter((field) => !savedIds.has(field._id)),
      savedFields
        .filter(
          (field) => !args.draftFields.some((draft) => draft._id === field._id),
        )
        .map((field) => field._id),
    );
    if (!conversions.some((field) => field._id === args.fieldId)) {
      throw conversionError(
        'UNSUPPORTED_TYPE',
        'Choose a different field type to check.',
      );
    }
    const deadline = performance.now() + 10_000;
    const inspection = await inspectFieldConversion(
      models,
      args.formId,
      args.fieldId,
      args.targetType,
      args.validator,
      { page: args.page, search: args.search, deadline },
    );
    const { fillCount, keptCount } = inspection.invalidCount
      ? { fillCount: 0, keptCount: 0 }
      : await countCustomerBackfill(subdomain, models, {
          formId: args.formId,
          fieldId: args.fieldId,
          targetType: args.targetType,
          deadline,
        }).catch(() => ({ fillCount: null, keptCount: null }));
    return {
      ...inspection,
      customersToFill: fillCount,
      customersKept: keptCount,
    };
  },
};
