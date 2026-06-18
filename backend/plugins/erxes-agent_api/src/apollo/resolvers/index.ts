import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { queries } from './queries';
import { mutations } from './mutations';
import { learningCustomResolvers } from '@/learning/graphql/resolvers/queries/learning';
import { scheduleCustomResolvers } from '@/schedule/graphql/resolvers/queries/schedule';

export const resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations },
  ...apolloCustomScalars,
  ...learningCustomResolvers,
  ...scheduleCustomResolvers,
};
