import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { queries } from './queries';
import { mutations } from './mutations';

export const resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations },
  ...apolloCustomScalars,
};
