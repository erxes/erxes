import { IContext } from '~/connectionResolvers';
import { IDonate } from '~/modules/donate/@types/donate';

export const donateMutations = {
  async createDonate(
    _root: undefined,
    doc: IDonate,
    { models, user }: IContext,
  ) {
    return models.Donate.createDonate(doc, user);
  },

  async removeDonate(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Donate.removeDonate(_id);
  },
};
