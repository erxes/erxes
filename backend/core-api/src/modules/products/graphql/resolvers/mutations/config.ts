import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

/**
 * Precomputed wildcard regex map for single-character similarity masks.
 * Mirrors the safe pattern used in queries/product.ts so that user-controlled
 * mask keys never reach a hand-rolled chained .replace() that could leak
 * un-escaped backslashes into the constructed RegExp source.
 */
const WILDCARD_REGEX = new Map<string, RegExp>([
  ['*', /^..*/giu],
  ['.', /^\..*/giu],
  ['_', /^..*/giu],
]);

export const configMutations = {
  /**
   * Create or update config object
   */
  async productsConfigsUpdate(
    _parent: undefined,
    { configsMap },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

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

          const codeRegex =
            WILDCARD_REGEX.get(mask) ??
            new RegExp(`.*${escapeRegExp(mask)}.*`, 'igu');

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
      // checkUOM normalizes the value (which may be a code, name or _id) to
      // the canonical UOM code and ensures the UOM exists.
      const normalizedUom = await models.Uoms.checkUOM({
        uom: defaultUOM,
        subUoms: [],
      });

      if (isRequireUOM) {
        await models.Products.updateMany(
          {
            $or: [{ uom: { $exists: false } }, { uom: '' }],
          },
          { $set: { uom: normalizedUom } },
        );
      }
    }

    return ['success'];
  },
};
