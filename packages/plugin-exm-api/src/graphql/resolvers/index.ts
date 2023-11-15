import customScalars from '@erxes/api-utils/src/customScalars';
import ExmCoreCategory from './category';

import Mutation from './Mutation';
import Query from './Query';

const resolvers: any = {
  ...customScalars,

  Mutation,
  Query,
  ExmCoreCategory
};

export default resolvers;
