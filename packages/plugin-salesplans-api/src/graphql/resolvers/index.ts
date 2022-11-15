import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { SalesLog } from './customResolvers/salesplans';
import YearPlan from './customResolvers/yearPlan';
import DayLabel from './customResolvers/dayLabel';

const resolvers: any = {
  ...customScalars,
  SalesLog,
  YearPlan,
  DayLabel,
  Mutation,
  Query
};

export default resolvers;
