import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
// import { sendCoreMessage } from '../../../messageBroker';

const itineraryMutations = {
  bmItineraryAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const element = await models.Itineraries.createItinerary(
      docModifier(doc),
      user
    );
    return element;
  },

  bmItineraryEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    const updated = await models.Itineraries.updateItinerary(_id, doc as any);
    return updated;
  },

  bmItineraryRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models, user }: IContext
  ) => {
    const cars = await models.Itineraries.find({ _id: { $in: ids } }).lean();

    await models.Itineraries.removeItinerary(ids);

    return ids;
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

export default itineraryMutations;
