import contactResolvers from '~/modules/sales/graphql/resolvers/customResolvers';
import posResolvers from '~/modules/pos/graphql/resolvers/customResolvers';

export const customResolvers = {
  ...contactResolvers,
  ...posResolvers,
};
