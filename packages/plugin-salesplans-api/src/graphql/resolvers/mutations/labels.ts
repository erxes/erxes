import { IContext } from '../../../connectionResolver';
import { ILabel, ILabelRule } from '../../../models/definitions/labels';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { sendProductsMessage } from '../../../messageBroker';

const sortRules = async (subdomain: string, rules: ILabelRule[]) => {
  const categoryIds = rules.map(r => r.productCategoryId || '');
  const categories = await sendProductsMessage({
    subdomain,
    action: 'categories.find',
    data: { query: { _id: { $in: categoryIds } } },
    isRPC: true,
    defaultValue: []
  });

  return rules.sort((a, b) => {
    const acat = categories.find(c => c._id === a.productCategoryId);
    const bcat = categories.find(c => c._id === b.productCategoryId);

    return String(acat.order).localeCompare(String(bcat.order));
  });
};

const labelsMutations = {
  spLabelsAdd: async (
    _root: any,
    doc: ILabel,
    { subdomain, models, user }: IContext
  ) => {
    doc.rules = await sortRules(subdomain, doc.rules || []);

    return await models.Labels.labelsAdd({
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
      createdUser: user._id,
      modifiedUser: user._id
    });
  },

  spLabelsEdit: async (
    _root: any,
    { _id, ...doc }: ILabel & { _id: string },
    { subdomain, models, user }: IContext
  ) => {
    doc.rules = await sortRules(subdomain, doc.rules || []);

    return await models.Labels.labelsEdit(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedUser: user._id
    });
  },

  spLabelsRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.Labels.labelsRemove(_ids);
  }
};

moduleRequireLogin(labelsMutations);
moduleCheckPermission(labelsMutations, 'manageSalesPlans');

export default labelsMutations;
