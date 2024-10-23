import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IUser } from '../../models/definitions/clientPortalUser';
import { customFieldsDataByFieldCode } from '../../utils';

const ClientPortalUser = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.ClientPortalUsers.findOne({ _id });
  },
  async clientPortal(user, _args, { models: { ClientPortals } }: IContext) {
    return (
      user.clientPortalId &&
      ClientPortals.findOne({
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

  async customFieldsDataByFieldCode(company: IUser, _, { subdomain }: IContext) {
    return customFieldsDataByFieldCode(company, subdomain);
  },

  async companyName(user, _args, { subdomain }: IContext) {
    if (user.erxesCompanyId) {
      const company = await sendCoreMessage({
        subdomain,
        action: 'companies.findOne',
        data: {
          _id: user.erxesCompanyId,
        },
        isRPC: true,
        defaultValue: null,
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
    return models.ClientPortalUserCards.findOne({ _id });
  },
  async cpUser(user, _args, { models: { ClientPortalUsers } }: IContext) {
    return (
      user.cpUserId &&
      ClientPortalUsers.findOne({
        _id: user.cpUserId,
      })
    );
  },
};

export { ClientPortalUser, ClientPortalParticipant };
