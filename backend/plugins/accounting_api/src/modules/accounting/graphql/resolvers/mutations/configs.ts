import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

// Configs whose value is a list of user ids that must always include the
// organization owner(s).
const OWNER_INCLUSIVE_CODES = new Set([
  'dominantReadAccountUsers',
  'dominantWriteAccountUsers',
]);

const configMutations = {
  async accountingsConfigsCreate(
    _root,
    { code, value, subId }: { code: string; value: any; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');
    return await models.Configs.createConfig({ code, subId, value });
  },

  async accountingsConfigsUpdate(
    _root,
    { _id, value, subId }: { _id: string; value: any; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');
    return await models.Configs.updateConfig(_id, value, subId);
  },

  async accountingsConfigsRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeAccountingConfigs');
    return await models.Configs.removeConfig(_id);
  },

  async accountingsConfigsUpdateByCode(
    _root,
    { configsMap }: { configsMap: any },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');
    const codes = Object.keys(configsMap);

    // Fetch the organization owner ids once, only when an owner-inclusive
    // config is being saved.
    const needsOwners = codes.some((code) => OWNER_INCLUSIVE_CODES.has(code));
    let ownerUserIds: string[] = [];

    if (needsOwners) {
      const ownerUsers = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'find',
        input: { query: { isOwner: true }, fields: { _id: 1 } },
        defaultValue: [],
      });
      ownerUserIds = (ownerUsers || []).map(
        (user: { _id: string }) => user._id,
      );
    }

    for (const code of codes) {
      if (!code) {
        continue;
      }

      let value = configsMap[code];

      // Always keep the organization owner(s) in the dominant access lists.
      if (OWNER_INCLUSIVE_CODES.has(code)) {
        value = Array.from(new Set([...(value || []), ...ownerUserIds]));
      }

      await models.Configs.updateSingleByCode(code, value);
    }

    return models.Configs.find({ code: { $in: codes }, subId: '' });
  },
};

export default configMutations;
