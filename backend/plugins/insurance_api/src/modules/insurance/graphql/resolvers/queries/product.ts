import { IContext } from '~/connectionResolvers';

export const productQueries = {
  insuranceProducts: Object.assign(
    async (_parent: undefined, _args: any, { models }: IContext) => {
      const products = await models.Product.find({}).populate(
        'insuranceType coveredRisks.risk',
      );
      return products
        .filter((p: any) => p && p._id && p.insuranceType)
        .map((p: any) => ({
          ...p.toObject(),
          coveredRisks: p.coveredRisks.filter((cr: any) => cr.risk != null),
        }));
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  insuranceProduct: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      const product = await models.Product.findById(id).populate(
        'insuranceType coveredRisks.risk',
      );

      if (!product) return null;

      return {
        ...product.toObject(),
        coveredRisks: product.coveredRisks.filter((cr: any) => cr.risk != null),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  productsByType: Object.assign(
    async (
      _parent: undefined,
      { typeId }: { typeId: string },
      { models }: IContext,
    ) => {
      const products = await models.Product.find({
        insuranceType: typeId,
      }).populate('insuranceType coveredRisks.risk');

      return products.map((p: any) => ({
        ...p.toObject(),
        coveredRisks: p.coveredRisks.filter((cr: any) => cr.risk != null),
      }));
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
