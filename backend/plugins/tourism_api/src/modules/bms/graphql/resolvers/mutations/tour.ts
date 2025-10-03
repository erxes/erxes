import { IContext } from '~/connectionResolvers';

const tourMutations = {
  bmsTourAdd: async (_root, doc, { user, models }: IContext) => {
    return models.Tours.createTour(doc, user);
  },

  bmsTourEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    const updated = await models.Tours.updateTour(_id, doc as any);
    return updated;
  },
  bmsTourViewCount: async (_root, { _id }, { models }: IContext) => {
    return await models.Tours.findOneAndUpdate(
      { _id: _id },
      { $inc: { viewCount: 1 } },
    ).exec();
  },

  bmsTourRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await models.Tours.removeTour(ids);

    return ids;
  },
};

export default tourMutations;
