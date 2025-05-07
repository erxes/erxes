import { IContext } from '../../connectionResolver';
import { ISyncRule } from '../../models/definitions/syncRule';
import { convertToPropertyData, otherPlugins, syncData } from '../../utils';

const xypMutations = {
  /**
   * Creates a new xyp
   */
  async xypDataAdd(_root, doc, { subdomain, models, user }: IContext) {
    const data = await models.XypData.createXypData(doc, user);
    await syncData(subdomain, models, data);

    await otherPlugins(subdomain, doc);
    return data;
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

  async xypSyncRuleAdd(_root, doc: ISyncRule, { models, user }: IContext) {
    return await models.SyncRules.createSyncRule(doc, user);
  },

  async xypSyncRuleEdit(
    _root,
    { _id, ...doc }: ISyncRule & { _id: string },
    { models, user }: IContext
  ) {
    const rule = await models.SyncRules.getSyncRule(_id);
    await models.SyncRules.updateSyncRule(_id, doc, user);
  },

  async xypSyncRuleRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return await models.SyncRules.deleteOne({ _id });
  },
};

export default xypMutations;
