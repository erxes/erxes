import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const configMutations = {
  /**
   * Create or update config object
   */
  async accountingsConfigsUpdate(_root, { configsMap }, { models }: IContext) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];
      const doc = { code, value };

      await models.AccountingsConfigs.createOrUpdateConfig(doc);

      if (code === 'similarityGroup') {
        const masks = Object.keys(value);
        await models.Accounts.updateMany({}, { $unset: { sameMasks: '' } });
        for (const mask of masks) {
          const codeRegex = new RegExp(
            `^${mask
              .replace(/\./g, '\\.')
              .replace(/\*/g, '.')
              .replace(/_/g, '.')}.*`,
            'igu',
          );

          const fieldIds = (value[mask].rules || []).map((r) => r.fieldId);
          await models.Accounts.updateMany(
            {
              code: { $in: [codeRegex] },
              'customFieldsData.field': { $in: fieldIds },
            },
            { $addToSet: { sameMasks: mask } },
          );
        }
      }
    }

    return ['success'];
  },
};

checkPermission(configMutations, 'accountingsConfigsUpdate', 'manageAccounts');

export default configMutations;
