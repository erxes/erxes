import bmsQueries from '@/bms/graphql/resolvers/queries';
import pmsQueries from '@/pms/graphql/resolvers/queries';

export default {
  ...bmsQueries,
  ...pmsQueries,
};
