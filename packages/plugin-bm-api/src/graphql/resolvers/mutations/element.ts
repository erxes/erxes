import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
// import { sendCoreMessage } from '../../../messageBroker';

const elementMutations = {
  bmElementAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const element = await models.Elements.createElement(docModifier(doc), user);
    return element;
  },

  bmElementEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    const updated = await models.Elements.updateElement(_id, doc as any);
    return updated;
  },

  bmElementRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models, user }: IContext
  ) => {
    return await models.Elements.removeElements(ids);
  },

  bmElementCategoryAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain, user }: IContext
  ) => {
    const carCategory = await models.ElementCategories.createElementCategory(
      docModifier(doc)
    );

    return carCategory;
  },

  bmElementCategoryEdit: async (
    _root,
    { _id, ...doc },
    { models, subdomain, user }: IContext
  ) => {
    const updated = await models.ElementCategories.updateElementCategory(
      _id,
      doc as any
    );
    return updated;
  },

  bmElementCategoryRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) => {
    const removed = await models.ElementCategories.removeElementCategory(_id);

    return removed;
  },
};

// requireLogin(carMutations, 'manageCars');

// checkPermission(carMutations, 'carsAdd', 'manageCars');
// checkPermission(carMutations, 'carsEdit', 'manageCars');
// checkPermission(carMutations, 'carsRemove', 'manageCars');
// checkPermission(carMutations, 'carsMerge', 'manageCars');
// checkPermission(carMutations, 'carCategoriesAdd', 'manageCars');
// checkPermission(carMutations, 'carCategoriesEdit', 'manageCars');
// checkPermission(carMutations, 'carCategoriesRemove', 'manageCars');

export default elementMutations;
