import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import type { IPricingFixedValue } from '../../../@types/pricingFixedValue';

export const pricingFixedValueMutations = {
  pricingFixedValueAdd: async (
    _root: any,
    { pricingPlanId, doc }: { pricingPlanId: string; doc: IPricingFixedValue },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanCreate');
    return models.PricingFixedValues.createFixedValue(
      { ...doc, pricingPlanId },
      user._id,
    );
  },

  pricingFixedValueEdit: async (
    _root: any,
    { id, doc }: { id: string; doc: Partial<IPricingFixedValue> },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanUpdate');
    return models.PricingFixedValues.updateFixedValue(id, doc, user._id);
  },

  pricingFixedValueRemove: async (
    _root: any,
    { id }: { id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanRemove');
    return models.PricingFixedValues.removeFixedValue(id);
  },

  pricingFixedValuesBulkEdit: async (
    _root: any,
    {
      pricingPlanId,
      productsData,
    }: { pricingPlanId: string; productsData: any[] },
    { models, user, checkPermission, subdomain }: IContext,
  ) => {
    await checkPermission('pricingPlanCreate');

    const productCodes = [
      ...new Set(
        productsData.map((r) => r.productCode).filter(Boolean) as string[],
      ),
    ];

    const products: any[] = productCodes.length
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'products',
          action: 'find',
          defaultValue: [],
          input: {
            query: { code: { $in: productCodes } },
            fields: { _id: 1, code: 1, uom: 1, unitPrice: 1 },
          },
        })
      : [];

    const productByCode = new Map<string, any>();
    for (const p of products) productByCode.set(p.code, p);

    let count = 0;
    const notFound: string[] = [];

    for (const row of productsData) {
      const product = productByCode.get(row.productCode);
      if (!product) {
        notFound.push(row.productCode);
        continue;
      }

      await models.PricingFixedValues.createFixedValue(
        {
          pricingPlanId,
          productId: product._id,
          sortField: row.productCode,
          uom: row.uom?.trim() || product.uom || '',
          unitPrice:
            row.unitPrice != null && row.unitPrice !== ''
              ? Number(row.unitPrice)
              : product.unitPrice || 0,
          newPrice: Number(row.newPrice),
        },
        user._id,
      );
      count++;
    }

    return { count, notFound };
  },
};
