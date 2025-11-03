import Ebarimt from '@/ebarimt/graphql/resolvers/customResolvers';
import Erkhet from '@/erkhet/graphql/resolvers/customResolvers';

export const customResolvers = {
  ...Ebarimt,
  ...Erkhet,
};
