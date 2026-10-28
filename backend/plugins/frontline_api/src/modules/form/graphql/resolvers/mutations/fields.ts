import type { ClientSession } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import type { IForm } from '~/modules/form/db/definitions/forms';
import {
  claimFormConversion,
  requireFormTransactions,
  runFormTransaction,
  supportsFormTransactions,
} from '~/modules/form/formWriteGuard';
import { IField, IFieldDocument } from '~/modules/form/db/definitions/fields';
import { validateFormFieldConversions } from '~/modules/form/fieldConversion';

export interface IFieldsEdit extends IField {
  _id: string;
  expectedType?: string;
}

export interface IFieldsBulkAddAndEditParams {
  contentType: string;
  contentTypeId: string;
  newFields: IField[];
  updatedFields: IFieldsEdit[];
  removedFieldIds: string[];
  formChanges?: Omit<IForm, '_id'>;
}

const applyFieldsBulkAction = async (
  args: IFieldsBulkAddAndEditParams,
  { user, models }: IContext,
  session?: ClientSession,
) => {
  if (!user?._id) throw new Error('Unauthorized');
  const {
    contentType,
    contentTypeId,
    newFields,
    updatedFields,
    removedFieldIds,
  } = structuredClone(args);
  const tempFieldIdsMap: { [key: string]: string } = {};
  const response: IFieldDocument[] = [];
  const logicalFields: IField[] = [];

  if (!newFields && !updatedFields) {
    return;
  }

  for (const f of newFields ?? []) {
    if (f.logics && f.logics.length > 0) {
      logicalFields.push(f);
      continue;
    }

    const tempId = f.tempFieldId;
    const field = await models.Fields.createField(
      {
        ...f,
        contentType,
        contentTypeId,
        lastUpdatedUserId: user._id,
      },
      session,
    );

    if (tempId) {
      tempFieldIdsMap[tempId] = field._id;
    }

    response.push(field);
  }

  for (const f of logicalFields) {
    const logics = f.logics || [];

    for (const logic of logics) {
      if (logic.fieldId && tempFieldIdsMap[logic.fieldId]) {
        logic.fieldId = tempFieldIdsMap[logic.fieldId];
      } else if (!logic.fieldId && logic.tempFieldId) {
        logic.fieldId = tempFieldIdsMap[logic.tempFieldId];
      }
    }

    const field = await models.Fields.createField(
      {
        ...f,
        contentType: 'form',
        contentTypeId,
        lastUpdatedUserId: user._id,
      },
      session,
    );

    if (f.tempFieldId) {
      tempFieldIdsMap[f.tempFieldId] = field._id;
    }

    response.push(field);
  }

  for (const { _id, expectedType, ...doc } of updatedFields || []) {
    if (doc.logics) {
      for (const logic of doc.logics) {
        if (logic.fieldId && tempFieldIdsMap[logic.fieldId]) {
          logic.fieldId = tempFieldIdsMap[logic.fieldId];
        } else if (!logic.fieldId && logic.tempFieldId) {
          logic.fieldId = tempFieldIdsMap[logic.tempFieldId];
        }
      }
    }

    const field = await models.Fields.updateField(
      _id,
      {
        ...doc,
        lastUpdatedUserId: user._id,
      },
      expectedType,
      session,
    );

    response.push(field);
  }

  if (removedFieldIds?.length > 0) {
    await models.Fields.deleteMany({ _id: { $in: removedFieldIds } }).session(
      session ?? null,
    );
  }

  const parentFields = response.filter((f) => f.type === 'parentField');

  for (const f of parentFields) {
    for (const subFieldId of f.subFieldIds || []) {
      if (subFieldId.startsWith('temp') && tempFieldIdsMap[subFieldId]) {
        const indexOfElement = (f.subFieldIds || []).indexOf(subFieldId);

        if (indexOfElement > -1) {
          const set: Record<string, string> = {};
          set[`subFieldIds.${indexOfElement}`] = tempFieldIdsMap[subFieldId];
          await models.Fields.updateOne(
            { _id: f._id },
            {
              $set: set,
            },
            { session },
          );
        }
      }
    }
  }

  return response;
};

export const fieldMutations = {
  async frontlineFieldsBulkAction(
    _root: unknown,
    args: IFieldsBulkAddAndEditParams,
    context: IContext,
  ) {
    const { models, user, checkPermission } = context;
    if (!user?._id) throw new Error('Unauthorized');
    const {
      contentType,
      contentTypeId,
      updatedFields = [],
      newFields = [],
      removedFieldIds = [],
      formChanges,
    } = args;
    if (contentType !== 'form') {
      if (formChanges) throw new Error('Form changes require a form');
      return applyFieldsBulkAction(args, context);
    }
    const converting = updatedFields.some(
      (field) => field.expectedType && field.expectedType !== field.type,
    );
    if (converting || formChanges) {
      await checkPermission('formsEdit');
      await requireFormTransactions(models);
      const form = await models.Forms.findOne({ _id: contentTypeId })
        .read('primary')
        .select('conversionRevision')
        .lean();
      if (!form) throw new Error('Form not found');
      // The expensive scan happens outside the short write transaction. All
      // submission and field writers advance this form's revision.
      await validateFormFieldConversions(
        models,
        contentTypeId,
        updatedFields,
        newFields,
        removedFieldIds,
      );
      return runFormTransaction(models, async (session) => {
        await claimFormConversion(
          models,
          contentTypeId,
          form.conversionRevision ?? 0,
          session,
        );
        const fields = await applyFieldsBulkAction(args, context, session);
        if (formChanges)
          await models.Forms.updateForm(contentTypeId, formChanges, session);
        return fields;
      });
    }
    if (await supportsFormTransactions(models)) {
      return runFormTransaction(models, async (session) => {
        await models.Forms.updateOne(
          { _id: contentTypeId },
          { $inc: { conversionRevision: 1 } },
          { session },
        );
        await validateFormFieldConversions(
          models,
          contentTypeId,
          updatedFields,
          newFields,
          removedFieldIds,
          session,
        );
        return applyFieldsBulkAction(args, context, session);
      });
    }
    await validateFormFieldConversions(
      models,
      contentTypeId,
      updatedFields,
      newFields,
      removedFieldIds,
    );
    return applyFieldsBulkAction(args, context);
  },
};
