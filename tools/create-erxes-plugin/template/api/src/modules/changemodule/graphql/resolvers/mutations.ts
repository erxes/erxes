import { IContext } from '../../../../connectionResolvers';
import { IChangemoduleItem } from '../../db/definitions/items';

export const changemoduleItemMutations = {
  async changemecChangemoduleItemAdd(
    _root: unknown,
    doc: IChangemoduleItem,
    { models }: IContext,
  ) {
    return await models.ChangemoduleItems.createItem(doc);
  },

  async changemecChangemoduleItemEdit(
    _root: unknown,
    { _id, ...fields }: { _id: string } & Partial<IChangemoduleItem>,
    { models }: IContext,
  ) {
    return await models.ChangemoduleItems.updateItem(_id, fields);
  },

  async changemecChangemoduleItemRemove(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    await models.ChangemoduleItems.removeItem(_id);
    return { status: 'success' };
  },
};
