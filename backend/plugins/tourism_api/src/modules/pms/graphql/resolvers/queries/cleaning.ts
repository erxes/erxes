import { IContext, IModels } from '~/connectionResolvers';

const cleaningQueries = {
  async pmsCleanings(_root, _args, { models }: IContext) {
    return models.Cleaning.find({});
  },

  async pmsCleaningsHistory(
    _root,
    { roomIds }: { roomIds: string[] },
    { models }: IContext,
  ) {
    return models.History.find({ roomId: { $in: roomIds || [] } });
  },
};

export default cleaningQueries;
