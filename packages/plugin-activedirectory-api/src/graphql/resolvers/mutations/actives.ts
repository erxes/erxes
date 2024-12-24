import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IConfigDocument } from '../../../models/definitions/actives';

const carMutations = {
  configsAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain }: IContext
  ) => {
    const car = await models.AdConfig.configAdd(docModifier(doc));

    return car;
  },

  configsEdit: async (
    _root,
    { _id, ...doc }: IConfigDocument,
    { models, user, subdomain }: IContext
  ) => {
    const updated = await models.AdConfig.configEdit(_id, doc);

    return updated;
  },

  configsRemove: async (
    _root,
    { carIds }: { carIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const cars = await models.AdConfig.find({ _id: { $in: carIds } }).lean();

    // await models.AdConfig.configDelete(carIds);

    return carIds;
  },
};

requireLogin(carMutations, 'manageCars');

checkPermission(carMutations, 'carsAdd', 'manageCars');
checkPermission(carMutations, 'carsEdit', 'manageCars');
checkPermission(carMutations, 'carsRemove', 'manageCars');
checkPermission(carMutations, 'carsMerge', 'manageCars');
checkPermission(carMutations, 'carCategoriesAdd', 'manageCars');
checkPermission(carMutations, 'carCategoriesEdit', 'manageCars');
checkPermission(carMutations, 'carCategoriesRemove', 'manageCars');

export default carMutations;
