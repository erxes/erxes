import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IDonate } from '~/modules/loyalty/@types/donates';

const donatesMutations = {
  async donatesAdd(_root, doc: IDonate, { models }: IContext) {
    return models.Donates.createDonate(doc);
  },

  async donatesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Donates.removeDonates(_ids);
  },

  async cpDonatesAdd(_root, doc: IDonate, { models }: IContext) {
    return models.Donates.createDonate({ ...doc });
  },

  async cpDonatesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Donates.removeDonates(_ids);
  },
};

checkPermission(donatesMutations, 'donatesAdd', 'manageLoyalties');
checkPermission(donatesMutations, 'donatesRemove', 'manageLoyalties');

export default donatesMutations;
