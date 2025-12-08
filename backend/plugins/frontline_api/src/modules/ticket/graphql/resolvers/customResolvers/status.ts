import { IContext } from '~/connectionResolvers';

export const Ticket = {
  async status({ statusId }, _params, { models }: IContext) {
    if (!statusId) {
      return null;
    }
    return await models.Status.findOne({ _id: statusId });
  },
};
