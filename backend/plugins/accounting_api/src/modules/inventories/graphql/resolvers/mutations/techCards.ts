import { IContext } from '~/connectionResolvers';
import { ITechCard } from '../../../@types/techCards';

const techCardMutations = {
  techCardAdd: async (
    _root: undefined,
    params: ITechCard,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageTechCards');

    return await models.TechCards.createTechCard(params, user._id);
  },

  techCardEdit: async (
    _root: undefined,
    params: ITechCard & { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('manageTechCards');

    return await models.TechCards.updateTechCard(params, user._id);
  },

  techCardRemove: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('removeTechCards');

    return await models.TechCards.removeTechCard(_id);
  },
};

export default techCardMutations;
