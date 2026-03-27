import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { mutations } from './mutations';
import { queries } from './queries';
import { customResolvers } from './resolvers';

const cr = customResolvers as any;

const resolvers: any = {
  Mutation: {
    ...mutations,
    ...(cr.Mutation || {}), // safe
  },

  Query: {
    ...queries,
    ...(cr.Query || {}),
  },

  ...apolloCustomScalars,

  ...Object.fromEntries(
    Object.entries(cr).filter(([key]) => key !== 'Query' && key !== 'Mutation'),
  ),
};

export default resolvers;
