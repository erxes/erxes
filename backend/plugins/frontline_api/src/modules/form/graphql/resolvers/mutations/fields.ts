import { IContext } from '~/connectionResolvers';
import { IField, IFieldDocument } from '~/modules/form/db/definitions/fields';

export interface IFieldsEdit extends IField {
  _id: string;
}

export interface IFieldsBulkAddAndEditParams {
  contentType: string;
  contentTypeId: string;
  newFields: IField[];
  updatedFields: IFieldsEdit[];
  removedFieldIds: string[];
}

export const fieldMutations = {
  async frontlineFieldsBulkAction(
    _root,
    args: IFieldsBulkAddAndEditParams,
    { user, models }: IContext,
  ) {
    const { contentType, contentTypeId, newFields, updatedFields, removedFieldIds } = args;
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
      const field = await models.Fields.createField({
        ...f,
        contentType,
        contentTypeId,
        lastUpdatedUserId: user._id,
      });

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

      const field = await models.Fields.createField({
        ...f,
        contentType: 'form',
        contentTypeId,
        lastUpdatedUserId: user._id,
      });

      if (f.tempFieldId) {
        tempFieldIdsMap[f.tempFieldId] = field._id;
      }

      response.push(field);
    }

    for (const { _id, ...doc } of updatedFields || []) {
      if (doc.logics) {
        for (const logic of doc.logics) {
          if (logic.fieldId && tempFieldIdsMap[logic.fieldId]) {
            logic.fieldId = tempFieldIdsMap[logic.fieldId];
          } else if (!logic.fieldId && logic.tempFieldId) {
            logic.fieldId = tempFieldIdsMap[logic.tempFieldId];
          }
        }
      }

      const field = await models.Fields.updateField(_id, {
        ...doc,
        lastUpdatedUserId: user._id,
      });

      response.push(field);
    }

    if (removedFieldIds?.length > 0) {
      await models.Fields.deleteMany({ _id: { $in: removedFieldIds } });
    }

    const parentFields = response.filter((f) => f.type === 'parentField');

    for (const f of parentFields) {
      for (const subFieldId of f.subFieldIds || []) {
        if (subFieldId.startsWith('temp') && tempFieldIdsMap[subFieldId]) {
          const indexOfElement = (f.subFieldIds || []).indexOf(subFieldId);

          if (indexOfElement > -1) {
            const set: any = {};
            set[`subFieldIds.${indexOfElement}`] = tempFieldIdsMap[subFieldId];
            await models.Fields.updateOne(
              { _id: f._id },
              {
                $set: set,
              },
            );
          }
        }
      }
    }

    return response;
  },
};

// markResolvers(fieldMutations, {
//   wrapperConfig: {
//     skipPermission: true,
//   },
// });
