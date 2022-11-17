import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { SalesLog } from './customResolvers/salesplans';
import YearPlan from './customResolvers/yearPlan';
import DayPlan from './customResolvers/dayPlan';
import DayLabel from './customResolvers/dayLabel';

const resolvers: any = {
  ...customScalars,
  SalesLog,
  YearPlan,
  DayPlan,
  DayLabel,
  Mutation,
  Query
};

export default resolvers;
