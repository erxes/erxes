import { IContext } from '../../../connectionResolver';
import { TemplateCategoryDocument } from '../../../models/definitions/templates';

const categoryMutations = {
  categoryAdd: async (
    _root,
    doc: TemplateCategoryDocument,
    { user, models, subdomain }: IContext
  ) => {
    return await models.TemplateCategories.createTemplateCategory(doc, user);
  },

  categoryEdit: async (
    _root,
    { _id, ...doc }: TemplateCategoryDocument,
    { user, models, subdomain }: IContext
  ) => {
    return await models.TemplateCategories.updateTemplateCategory(
      _id,
      doc,
      user
    );
  },

  categoryRemove: async (
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) => {
    return await models.TemplateCategories.removeTemplateCategory(_id);
  }
};

export default categoryMutations;
