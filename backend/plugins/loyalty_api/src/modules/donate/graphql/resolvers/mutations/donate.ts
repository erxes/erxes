import { IDonate } from '@/donate/@types/donate';
import { IContext } from '~/connectionResolvers';

export const donateMutations = {
  async donatesAdd(_root: undefined, doc: IDonate, { models }: IContext) {
    return models.Donates.createDonate(doc);
  },

  async donatesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Donates.removeDonates(_ids);
  },

  async cpDonatesAdd(_root: undefined, doc: IDonate, { models }: IContext) {
    return models.Donates.createDonate({ ...doc });
  },

  async cpDonatesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Donates.removeDonates(_ids);
  },
};
