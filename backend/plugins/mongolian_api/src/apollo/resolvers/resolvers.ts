import Ebarimt from '@/ebarimt/graphql/resolvers/customResolvers';
import Erkhet from '@/erkhet/graphql/resolvers/customResolvers';
import Msdynamic from '@/msdynamic/graphql/resolvers/customResolvers/syncLog';

export const customResolvers = {
  ...Ebarimt,
  ...Erkhet,
  ...Msdynamic,
};
