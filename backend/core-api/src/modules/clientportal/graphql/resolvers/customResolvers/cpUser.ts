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
};
