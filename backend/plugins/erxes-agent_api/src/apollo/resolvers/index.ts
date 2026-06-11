import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { queries } from './queries';
import { mutations } from './mutations';
import { learningCustomResolvers } from '@/learning/graphql/resolvers/queries/learning';

export const resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations },
  ...apolloCustomScalars,
  ...learningCustomResolvers,
};
