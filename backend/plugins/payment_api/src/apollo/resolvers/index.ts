import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { customResolvers } from './resolvers';
import { mutations } from './mutations';
import { queries } from './queries';
import golomtResolvers from '@/corporateGateway/golomtbank/graphql/resolvers';
const resolvers: any = {
  ...golomtResolvers,
  Mutation: {
    ...mutations,
    ...(golomtResolvers.Mutation || {}),
  },
  Query: {
    ...queries,
    ...(golomtResolvers.Query || {}),
  },
  ...apolloCustomScalars,
  ...customResolvers,
};

export default resolvers;
