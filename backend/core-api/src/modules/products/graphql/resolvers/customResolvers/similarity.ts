import { IProductSimilarityDocument } from '@/products/@types/similarity';
import { PRODUCT_STATUSES } from '@/products/constants';
import { IContext } from '~/connectionResolvers';

export default {
  async products(
    similarity: IProductSimilarityDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!similarity.productIds?.length) return [];

    return models.Products.find({
      _id: { $in: similarity.productIds },
      status: { $ne: PRODUCT_STATUSES.DELETED },
    })
      .sort({ code: 1 })
      .lean();
  },

  fields: async (
    similarity: IProductSimilarityDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    const fieldIds = Object.keys(similarity.propertiesData || {});

    if (!fieldIds.length) {
      return [];
    }

    const fields = await models.Fields.find({ _id: { $in: fieldIds } })
      .select({ _id: 1, name: 1 })
      .lean();

    return fieldIds.map((fieldId) => ({
      fieldId,
      text: fields.find((f) => f._id === fieldId)?.name || fieldId,
      values: similarity.propertiesData?.[fieldId] || [],
    }));
  },

  info: async (
    similarity: IProductSimilarityDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    const { info } = similarity || {};

    if (!info?.uom) {
      return info;
    }

    const uom = await models.Uoms.findOne({
      $or: [{ _id: info.uom }, { name: info.uom }, { code: info.uom }],
    }).lean();

    if (!uom) {
      return info;
    }

    return { ...info, uom: uom.name || uom.code || info.uom };
  },
};
