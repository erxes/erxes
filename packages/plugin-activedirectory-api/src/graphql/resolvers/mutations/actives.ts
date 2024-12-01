import { IContext } from '../../../connectionResolver';

const adMutations = {
  activeAdd: async (_root, doc, { user, docModifier, models }) => {
    const ad = await models.ActiveDirectory.createAD(docModifier(doc), user);

    return ad;
  },

  activeEdit: async (_root, { _id, ...doc }, { models }) => {
    const updated = await models.ActiveDirectory.updateAD(_id, doc);

    return updated;
  },

  activeRemove: async (
    _root,
    { carIds }: { carIds: string[] },
    { models }: IContext
  ) => {
    await models.ActiveDirectory.removeADs(carIds);

    return carIds;
  },
};

export default adMutations;
