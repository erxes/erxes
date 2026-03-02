import { IContext } from '~/connectionResolvers';
import { ITemplateCategory } from '../../@types';

const categoryMutations = {
  templateCategoryAdd: async (
    _root: undefined,
    doc: ITemplateCategory,
    { user, models }: IContext,
  ) => {
    return await models.TemplateCategory.createTemplateCategory(doc, user);
  },

  templateCategoryEdit: async (
    _root: undefined,
    { _id, ...doc }: ITemplateCategory & { _id: string },
    { user, models }: IContext,
  ) => {
    return await models.TemplateCategory.updateTemplateCategory(_id, doc, user);
  },

  templateCategoryRemove: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.TemplateCategory.removeTemplateCategory(_id);
  },
};

export default categoryMutations