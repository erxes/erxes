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

      if (code === 'similarityGroup') {
        const masks = Object.keys(value);
        await models.Products.updateMany({}, { $unset: { sameMasks: '' } });
        for (const mask of masks) {
          const codeRegex = new RegExp(
            `^${mask
              .replace(/\./g, '\\.')
              .replace(/\*/g, '.')
              .replace(/_/g, '.')}.*`,
            'igu'
          );

          const fieldIds = (value[mask].rules || []).map(r => r.fieldId);
          await models.Products.updateMany(
            {
              code: { $in: [codeRegex] },
              'customFieldsData.field': { $in: fieldIds }
            },
            { $addToSet: { sameMasks: mask } }
          );
        }
      }
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
