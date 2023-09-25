import { IContext } from '../../../connectionResolver';

const syncMutations = {
  async addSaasSync(_root, args, { models, user }: IContext) {
    return await models.Sync.addSync(args, user);
  },
  async editSaasSync(_root, { _id, ...doc }, { models }: IContext) {
    return await models.Sync.editSync(_id, doc);
  },
  async removeSaasSync(_root, { _id }, { models }: IContext) {
    return await models.Sync.removeSync(_id);
  },
  async saveSyncedSaasConfig(_root, { _id, config }, { models }: IContext) {
    return await models.Sync.updateOne({ _id }, { $set: { config } });
  },
  async syncSaasDealsAdd(_root, { syncId, dealData }, { models }: IContext) {
    return await models.SyncedDeals.addDeal(syncId, dealData);
  }
};

export default syncMutations;
