import { IContext } from '~/connectionResolvers';
import { IFieldGroup } from '~/modules/properties/@types';

export const groupMutations = {
  fieldGroupAdd: async (
    _root: any,
    doc: IFieldGroup,
    { models, user }: IContext,
  ) => {
    return await models.FieldsGroups.createGroup(doc, user);
  },
  fieldGroupEdit: async (
    _root: any,
    { _id, ...doc }: { _id: string } & IFieldGroup,
    { models, user }: IContext,
  ) => {
    return await models.FieldsGroups.updateGroup(_id, doc, user);
  },
  fieldGroupRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.FieldsGroups.removeGroup(_id);
  },
};
