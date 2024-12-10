import customScalars from '@erxes/api-utils/src/customScalars';
import { sendCoreMessage } from "../../messageBroker";
import mutations from './mutations';
import queries from './queries';
import { IContext } from '../../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';

const Sample = {
  async currentType(sample, { }, { models }: IContext) {
    return models.Types.findOne({ _id: sample.typeId });
  },
  async activeCustomers(sample, { }, { subdomain }: IContext) {
    const customers = await sendCoreMessage({
      subdomain,
      action: 'customers.findActiveCustomers',
      data: {
        selectors: {
          emailValidationStatus: { $eq: 'valid' },
          phoneValidationStatus: { $eq: 'valid' },
          profileScore: { $gte: 20 }
        },
        limit: 10
      },
      isRPC: true,
      defaultValue: []
    })

    if (!customers.length) {
      return null
    }

    return customers
  }
};

const resolvers: any = async () => ({
  ...customScalars,
  Sample,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
