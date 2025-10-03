import { IContext } from '~/connectionResolvers';

export const configMutations = {
  /**
   * Create or update config object
   */
  async productsConfigsUpdate(
    _parent: undefined,
    { configsMap },
    { models }: IContext,
  ) {
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

        await models.Products.updateMany(
          {},
          { $unset: { sameMasks: '', sameDefault: '' } },
        );

        for (const mask of masks) {
          const maskValue = value[mask];

          const codeRegex = ['*', '.', '_'].includes(mask)
            ? new RegExp(
                `^${mask
                  .replace(/\./g, '\\.')
                  .replace(/\*/g, '.')
                  .replace(/_/g, '.')}.*`,
                'igu',
              )
            : new RegExp(`.*${mask}.*`, 'igu');

          const fieldFilter = (maskValue.filterField || 'code').includes(
            'customFieldsData.',
          )
            ? {
                'customFieldsData.field': maskValue.filterField.replace(
                  'customFieldsData.',
                  '',
                ),
                'customFieldsData.stringValue': { $in: [codeRegex] },
              }
            : { [maskValue.filterField || 'code']: { $in: [codeRegex] } };

          const fieldIds = (maskValue.rules || []).map((r) => r.fieldId);

          await models.Products.updateMany(
            {
              $and: [
                { ...fieldFilter },
                { 'customFieldsData.field': { $in: fieldIds } },
              ],
            },
            { $addToSet: { sameMasks: mask } },
          );

          if (maskValue.defaultProduct) {
            await models.Products.updateOne(
              { _id: maskValue.defaultProduct },
              { $addToSet: { sameDefault: mask } },
            );
          }
        }
      }
    }

    const { isRequireUOM, defaultUOM } = configsMap;

    if (isRequireUOM && !defaultUOM) {
      throw new Error('Must fill default UOM');
    }

    if (defaultUOM) {
      await models.Uoms.checkUOM({ uom: defaultUOM, subUoms: [] });
    }

    if (isRequireUOM && defaultUOM) {
      await models.Products.updateMany(
        {
          $or: [{ uom: { $exists: false } }, { uom: '' }],
        },
        { $set: { uom: defaultUOM } },
      );
    }

    return ['success'];
  },
};
