import { IContext } from '~/connectionResolvers';

const ClientPortal = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.Portals.findOne({ _id });
  },

  async environmentVariables(clientPortal, _args, { user }: IContext) {
    if (!user) {
      return null;
    }

    return clientPortal.environmentVariables;
  },
};

export { ClientPortal };
