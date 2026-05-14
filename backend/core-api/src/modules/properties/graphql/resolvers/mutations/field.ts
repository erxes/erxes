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
};
