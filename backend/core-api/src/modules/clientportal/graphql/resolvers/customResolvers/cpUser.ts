import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IContext } from '~/connectionResolvers';

export default {
  clientPortal: async (
    user: ICPUserDocument,
    _params: unknown,
    { models }: IContext,
  ) => {
    if (!user?.clientPortalId) return null;
    return models.ClientPortal.findOne({ _id: user.clientPortalId }).lean();
  },
  customer: async (
    user: ICPUserDocument,
    _params: unknown,
    { models }: IContext,
  ) => {
    if (!user?.erxesCustomerId) return null;
    return models.Customers.findOne({ _id: user.erxesCustomerId }).lean();
  },
  company: async (
    user: ICPUserDocument,
    _params: unknown,
    { models }: IContext,
  ) => {
    if (!user?.erxesCompanyId) return null;
    return models.Companies.findOne({ _id: user.erxesCompanyId }).lean();
  },
  propertiesData: async (
    user: ICPUserDocument,
    _params: unknown,
    { models }: IContext,
  ) => {
    if (!user?.erxesCustomerId && !user?.erxesCompanyId) return {};

    const customer = await models.Customers.findOne({
      _id: user.erxesCustomerId,
    }).lean();

    const company = await models.Companies.findOne({
      _id: user.erxesCompanyId,
    }).lean();

    return customer?.propertiesData || company?.propertiesData || {};
  },
};
