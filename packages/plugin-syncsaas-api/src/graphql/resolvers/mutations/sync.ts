import { IContext, models } from '../../../connectionResolver';

const syncMutations = {
  async addSaasSync(_root, args, { models, subdomain, user }: IContext) {
    return await models.Sync.addSync(args, user);
  },
  async editSaasSync(_root, { _id, ...doc }, { models, subdomain }: IContext) {
    return await models.Sync.editSync(_id, doc);
  },
  async removeSaasSync(_root, { _id }, { models, subdomain }: IContext) {
    return await models.Sync.removeSync(_id);
  },
  async saveSyncedSaasConfig(_root, { _id, config }, { models }: IContext) {
    return await models.Sync.updateOne({ _id }, { $set: { config } });
  }
};

export default syncMutations;
