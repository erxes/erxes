import { IContext } from '~/connectionResolvers';
import { IField, IFieldOptionMigration } from '~/modules/properties/@types';

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
    {
      _id,
      optionValueMigrations,
      ...doc
    }: { _id: string; optionValueMigrations?: IFieldOptionMigration[] } & IField,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return await models.Fields.updateField(
      _id,
      doc,
      user,
      optionValueMigrations,
    );
  },
  fieldRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('fieldsManage');

    return await models.Fields.removeField(_id);
  },
};
