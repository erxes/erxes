import customScalars from '@erxes/api-utils/src/customScalars';
import golomtConfigs from './mutations/configMutation';
import accounts from './queries/accounts';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...golomtConfigs
  },
  Query: {
    ...accounts
  }
};

export default resolvers;
