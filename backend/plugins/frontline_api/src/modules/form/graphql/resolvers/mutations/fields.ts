import { IOrderInput } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { IField, IFieldDocument } from '~/modules/form/db/definitions/fields';
import { markResolvers } from 'erxes-api-shared/utils';

interface IFieldsEdit extends IField {
  _id: string;
}

interface IUpdateVisibleParams {
  _id: string;
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
}

interface IFieldsBulkAddAndEditParams {
  contentType: string;
  contentTypeId: string;
  newFields: IField[];
  updatedFields: IFieldsEdit[];
}

export const fieldMutations = {
  /**
   * Adds field object
   */
  async fieldsAdd(_root, args: IField, { user, models }: IContext) {
    const field = await models.Fields.createField({
      ...args,
      lastUpdatedUserId: user._id,
    });

    // await putCreateLog(
    //   models,
    //   subdomain,
    //   {
    //     type: 'field',
    //     newData: args,
    //     object: field,
    //     description: `Field "${args.text}" has been created`,
    //   },
    //   user,
    // );

    return field;
  },

  async frontlineFieldsBulkAction(
    _root,
    args: IFieldsBulkAddAndEditParams,
    { user, models }: IContext,
  ) {
    console.log('frontlineFieldsBulkAction');
    const { contentType, contentTypeId, newFields, updatedFields } = args;
    const tempFieldIdsMap: { [key: string]: string } = {};
    const response: IFieldDocument[] = [];
    const logicalFields: IField[] = [];

    if (!newFields && !updatedFields) {
      return;
    }

    for (const f of newFields) {
      if (f.logics && f.logics.length > 0) {
        logicalFields.push(f);
        continue;
      }

      const tempId = f.tempFieldId;
      console.log(tempId, 'tempId');
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
        if (f.logics && !logic.fieldId && logic.tempFieldId) {
          f.logics[logics.indexOf(logic)].fieldId =
            tempFieldIdsMap[logic.tempFieldId];
        }
      }

      const field = await models.Fields.createField({
        ...f,
        contentType,
        contentTypeId,
        lastUpdatedUserId: user._id,
      });

      if (f.tempFieldId) {
        tempFieldIdsMap[f.tempFieldId] = field._id;
        console.log(tempFieldIdsMap[f.tempFieldId], '-----asdasd');
      }

      response.push(field);
    }

    for (const { _id, ...doc } of updatedFields || []) {
      if (doc.logics) {
        for (const logic of doc.logics) {
          if (!logic.fieldId && logic.tempFieldId) {
            doc.logics[doc.logics.indexOf(logic)].fieldId =
              tempFieldIdsMap[logic.tempFieldId];
          }
        }
      }

      const field = await models.Fields.updateField(_id, {
        ...doc,
        lastUpdatedUserId: user._id,
      });

      response.push(field);
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

  /**
   * Updates field object
   */
  async fieldsEdit(
    _root,
    { _id, ...doc }: IFieldsEdit,
    { user, models }: IContext,
  ) {
    return models.Fields.updateField(_id, {
      ...doc,
      lastUpdatedUserId: user._id,
    });
  },

  /**
   * Remove a channel
   */
  async fieldsRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Fields.removeField(_id);
  },

  /**
   * Update field orders
   */
  async fieldsUpdateOrder(
    _root,
    { orders }: { orders: IOrderInput[] },
    { models }: IContext,
  ) {
    return models.Fields.updateOrder(orders);
  },

  /**
   * Update field's visible
   */
  async fieldsUpdateVisible(
    _root,
    { _id, isVisible, isVisibleInDetail }: IUpdateVisibleParams,
    { user, models }: IContext,
  ) {
    return models.Fields.updateFieldsVisible(
      _id,
      user._id,
      isVisible,
      isVisibleInDetail,
    );
  },

  /**
   * Update field's visible to create
   */
  async fieldsUpdateSystemFields(
    _root,
    {
      _id,
      isVisibleToCreate,
      isRequired,
    }: { _id: string; isVisibleToCreate?: boolean; isRequired?: boolean },
    { user, models }: IContext,
  ) {
    const doc: any = { lastUpdatedUserId: user._id };

    if (isVisibleToCreate !== undefined) {
      doc.isVisibleToCreate = isVisibleToCreate;
    }

    if (isRequired !== undefined) {
      doc.isRequired = isRequired;
    }

    await models.Fields.updateOne(
      {
        _id,
      },
      {
        $set: doc,
      },
    );

    return models.Fields.findOne({
      _id,
    });
  },
};

// markResolvers(fieldMutations, {
//   wrapperConfig: {
//     skipPermission: true,
//   },
// });

// checkPermission(fieldMutations, "fieldsAdd", "manageForms");
// checkPermission(fieldMutations, "fieldsBulkAction", "manageForms");
// checkPermission(fieldMutations, "fieldsEdit", "manageForms");
// checkPermission(fieldMutations, "fieldsRemove", "manageForms");
// checkPermission(fieldMutations, "fieldsUpdateOrder", "manageForms");
// checkPermission(fieldMutations, "fieldsUpdateVisible", "manageForms");
// checkPermission(fieldMutations, "fieldsUpdateSystemFields", "manageForms");

// checkPermission(fieldsGroupsMutations, "fieldsGroupsAdd", "manageForms");
// checkPermission(fieldsGroupsMutations, "fieldsGroupsEdit", "manageForms");
// checkPermission(fieldsGroupsMutations, "fieldsGroupsRemove", "manageForms");
// checkPermission(
//   fieldsGroupsMutations,
//   "fieldsGroupsUpdateVisible",
//   "manageForms",
// );
// checkPermission(
//   fieldsGroupsMutations,
//   "fieldsGroupsUpdateOrder",
//   "manageForms",
// );
