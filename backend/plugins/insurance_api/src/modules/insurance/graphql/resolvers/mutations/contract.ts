import { IContext } from '~/connectionResolvers';

export const contractMutations = {
  createInsuranceContract: async (_parent: undefined, { vendorId, customerId, productId, insuredObject, startDate, endDate }: { vendorId: string; customerId: string; productId: string; insuredObject: any; startDate: Date; endDate: Date }, { models }: IContext) => {
    const product = await models.Product.findById(productId);
    if (!product) throw new Error('Product not found');

    return models.Contract.create({
      vendor: vendorId,
      customer: customerId,
      insuranceType: product.insuranceType,
      insuranceProduct: productId,
      coveredRisks: product.coveredRisks,
      chargedAmount: 0, // TODO: calculate
      startDate,
      endDate,
      insuredObject,
      paymentKind: 'cash',
      paymentStatus: 'pending'
    });
  },
};