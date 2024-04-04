import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IDonate } from '../../../models/definitions/donates';

const donatesMutations = {
  async donatesAdd(_root, doc: IDonate, { models }: IContext) {
    return models.Donates.createDonate(doc);
  },

  async donatesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.Donates.removeDonates(_ids);
  },

  async cpDonatesAdd(_root, doc: IDonate, { models }: IContext) {
    return models.Donates.createDonate({ ...doc });
  },

  async cpDonatesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.Donates.removeDonates(_ids);
  }
};

checkPermission(donatesMutations, 'donatesAdd', 'manageLoyalties');
checkPermission(donatesMutations, 'donatesRemove', 'manageLoyalties');

export default donatesMutations;
