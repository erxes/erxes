import { IContext } from '~/connectionResolvers';

export const contractQueries = {
  contracts: async (
    _parent: undefined,
    { vendorId, customerId }: { vendorId?: string; customerId?: string },
    { models }: IContext,
  ) => {
    const query: any = {};
    if (vendorId) query.vendor = vendorId;
    if (customerId) query.customer = customerId;

    const contracts = await models.Contract.find(query).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    return contracts
      .filter((c: any) => c.insuranceProduct != null)
      .map((c: any) => ({
        ...c.toObject(),
        coveredRisks: c.coveredRisks.filter((cr: any) => cr.risk != null),
      }));
  },

  contract: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    const contract = await models.Contract.findById(id).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    if (!contract || !contract.insuranceProduct) return null;

    return {
      ...contract.toObject(),
      coveredRisks: contract.coveredRisks.filter((cr: any) => cr.risk != null),
    };
  },

  vendorContracts: async (
    _parent: undefined,
    _args: any,
    { models, user }: IContext,
  ) => {
    if (!user) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(user.id);
    if (!vendorUser) throw new Error('Vendor user not found');

    const contracts = await models.Contract.find({
      vendor: vendorUser.vendor,
    }).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    return contracts
      .filter((c: any) => c.insuranceProduct != null)
      .map((c: any) => ({
        ...c.toObject(),
        coveredRisks: c.coveredRisks.filter((cr: any) => cr.risk != null),
      }));
  },

  vendorContract: async (
    _parent: undefined,
    { id }: { id: string },
    { models, user }: IContext,
  ) => {
    if (!user) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(user.id);
    if (!vendorUser) throw new Error('Vendor user not found');

    const contract = await models.Contract.findOne({
      _id: id,
      vendor: vendorUser.vendor,
    }).populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );

    if (!contract || !contract.insuranceProduct) return null;

    return {
      ...contract.toObject(),
      coveredRisks: contract.coveredRisks.filter((cr: any) => cr.risk != null),
    };
  },
};
