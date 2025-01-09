import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const tourMutations = {
  bmTourAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext,
  ) => {
    const element = await models.Tours.createTour(docModifier(doc), user);
    return element;
  },

  bmTourEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext,
  ) => {
    const updated = await models.Tours.updateTour(_id, doc as any);
    return updated;
  },
  bmTourViewCount: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext,
  ) => {
    return await models.Tours.findOneAndUpdate(
      { _id: _id },
      { $inc: { viewCount: 1 } },
    ).exec();
  },
  bmTourRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models, user }: IContext,
  ) => {
    await models.Tours.removeTour(ids);

    return ids;
  },
};

export default tourMutations;
