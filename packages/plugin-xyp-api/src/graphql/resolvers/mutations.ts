import { IContext } from '../../connectionResolver';
import { ISyncRule } from '../../models/definitions/syncRule';
import { convertToPropertyData } from '../../utils';

const xypMutations = {
  /**
   * Creates a new xyp
   */
  async xypDataAdd(_root, doc, { models, user }: IContext) {
    return models.XypData.createXypData(doc, user);
  },

  /**
   * Edits a new xyp
   */
  async xypDataUpdate(_root, { _id, ...doc }, { models, user }: IContext) {
    return models.XypData.updateXypData(_id, doc, user);
  },

  /**
   * Removes a single xyp
   */
  async xypDataRemove(_root, { _id }, { models, user }: IContext) {
    return models.XypData.removeXypData(_id);
  },

  async xypDataCreateOrUpdate(_root, { ...doc }, { models, user }: IContext) {
    return models.XypData.createOrUpdateXypData(doc, user);
  },

  async xypConvertToCustomeFields(
    _root,
    { _id },
    { models, user, subdomain }: IContext,
  ) {
    return await convertToPropertyData(models, subdomain, { customerId: _id });
  },

  async xypSyncRuleAdd(_root, doc: ISyncRule, { models, user }: IContext) {
    return await models.SyncRules.createSyncRule(doc, user);
  },

  async xypSyncRuleEdit(_root, { _id, ...doc }: ISyncRule & { _id: string }, { models, user }: IContext) {
    const rule = await models.SyncRules.getSyncRule(_id);
    await models.SyncRules.updateSyncRule(_id, doc, user)

  },

  async xypSyncRuleRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return await models.SyncRules.deleteOne({ _id });
  }
};

export default xypMutations;
