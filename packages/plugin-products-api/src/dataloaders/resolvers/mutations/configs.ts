import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const configMutations = {
  /**
   * Create or update config object
   */
  async productsConfigsUpdate(_root, { configsMap }, { models }: IContext) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];
      const doc = { code, value };

      await models.ProductsConfigs.createOrUpdateConfig(doc);
    }

    const { isRequireUOM, defaultUOM } = configsMap;

    if (isRequireUOM && !defaultUOM) {
      throw new Error('must fill default UOM');
    }

    if (defaultUOM) {
      await models.Uoms.checkUOM({ uom: defaultUOM, subUoms: [] });
    }

    if (isRequireUOM && defaultUOM) {
      await models.Products.updateMany(
        {
          $or: [{ uom: { $exists: false } }, { uom: '' }]
        },
        { $set: { uom: defaultUOM } }
      );
    }
    return ['success'];
  }
};

checkPermission(configMutations, 'productsConfigsUpdate', 'manageProducts');

export default configMutations;
