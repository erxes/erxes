import { IContext } from '../../connectionResolver';

const ClientPortal = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.ClientPortals.findOne({ _id });
  },

  async environmentVariables(clientPortal, _args, {  user  }: IContext) {
    if (!user) {
      return null
    }

    return clientPortal.environmentVariables;
  }
};

export { ClientPortal };
