import { IContext } from '../../connectionResolver';

const ClientPortalUser = {
  clientPortal(user, _args, { models: { ClientPortals } }: IContext) {
    return (
      user.clientPortalId &&
      ClientPortals.findOne({
        _id: user.clientPortalId
      })
    );
  },

  customer(user) {
    return (
      user.erxesCustomerId && {
        __typename: 'Customer',
        _id: user.erxesCustomerId
      }
    );
  },

  company(user) {
    return (
      user.erxesCompanyId && {
        __typename: 'Company',
        _id: user.erxesCompanyId
      }
    );
  }
};

export { ClientPortalUser };
