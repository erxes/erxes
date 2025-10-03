import { IContext } from '~/connectionResolvers';
import { IUser } from '@/portal/@types/user';
import { customFieldsDataByFieldCode } from '@/portal/utils/common';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const ClientPortalUser = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.Users.findOne({ _id });
  },
  async clientPortal(user, _args, { models: { Portals } }: IContext) {
    return (
      user.clientPortalId &&
      Portals.findOne({
        _id: user.clientPortalId,
      })
    );
  },

  customer(user) {
    return (
      user.erxesCustomerId && {
        __typename: 'Customer',
        _id: user.erxesCustomerId,
      }
    );
  },

  company(user) {
    return (
      user.erxesCompanyId && {
        __typename: 'Company',
        _id: user.erxesCompanyId,
      }
    );
  },

  async customFieldsDataByFieldCode(company: IUser) {
    return customFieldsDataByFieldCode(company);
  },

  async companyName(user) {
    if (user.erxesCompanyId) {


      const company = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'core',
        action: 'companies.findOne',
        input: { _id: user.erxesCompanyId },
      });

      if (!company) {
        return user.companyName;
      }

      return company.primaryName;
    }
  },
};

const ClientPortalParticipant = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.UserCards.findOne({ _id });
  },
  async cpUser(user, _args, { models: { Users } }: IContext) {
    return (
      user.cpUserId &&
      Users.findOne({
        _id: user.cpUserId,
      })
    );
  },
};

export { ClientPortalUser, ClientPortalParticipant };
