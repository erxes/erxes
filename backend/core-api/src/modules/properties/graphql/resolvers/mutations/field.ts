import { IContext } from '~/connectionResolvers';
import { IField } from '~/modules/properties/@types';

export const fieldMutations = {
  fieldAdd: async (
    _root: any,
    doc: IField,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return await models.Fields.createField(doc, user);
  },
  fieldEdit: async (
    _root: any,
    { _id, ...doc }: { _id: string } & IField,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return await models.Fields.updateField(_id, doc, user);
  },
  fieldRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return await models.Fields.removeField(_id);
  },
  fieldsRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    await models.Fields.removeFields(_ids);

    return { removed: _ids.length };
  },
  fieldsArchive: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    await models.Fields.archiveFields(_ids, user);

    return { archived: _ids.length };
  },
  fieldRestore: async (
    _root: any,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return await models.Fields.restoreField(_id);
  },
};
