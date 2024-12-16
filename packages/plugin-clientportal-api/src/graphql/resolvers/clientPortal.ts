import { IContext } from '../../connectionResolver';

const ClientPortal = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.ClientPortals.findOne({ _id });
  },
};

export { ClientPortal };
