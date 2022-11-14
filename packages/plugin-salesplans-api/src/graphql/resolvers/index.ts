import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { SalesLog } from './customResolvers/salesplans';
import YearPlan from './customResolvers/yearPlan';

const resolvers: any = {
  ...customScalars,
  SalesLog,
  YearPlan,
  Mutation,
  Query
};

export default resolvers;
