import { IContext } from '../../../connectionResolver';
import {
  IInsuranceCategory,
  IInsuranceCategoryDocument
} from '../../../models/definitions/category';

const mutations = {
  insuranceCategoryAdd: async (
    _root,
    doc: IInsuranceCategory,
    { models, user }: IContext
  ) => {
    return models.Categories.createInsuranceCategory(doc, user ? user._id : '');
  },

  insuranceCategoryEdit: async (
    _root,
    doc: IInsuranceCategoryDocument,
    { models, user }: IContext
  ) => {
    return models.Categories.updateInsuranceCategory(doc, user._id);
  },

  insuranceCategoryRemove: async (_root, { _id }, { models }: IContext) => {
    await models.Categories.remove({ _id });
    return 'removed';
  }
};

export default mutations;
