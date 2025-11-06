import bmsMutations from '@/bms/graphql/resolvers/mutations';
import pmsMutations from '@/pms/graphql/resolvers/mutations';

export default {
  ...bmsMutations,
  ...pmsMutations,
};
