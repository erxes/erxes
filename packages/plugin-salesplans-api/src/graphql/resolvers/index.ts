import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import YearPlan from './customResolvers/yearPlan';
import DayPlan from './customResolvers/dayPlan';
import TimeProportion from './customResolvers/timeProportion';
import DayLabel from './customResolvers/dayLabel';
import SPLabel from './customResolvers/label';

const resolvers: any = {
  ...customScalars,
  YearPlan,
  DayPlan,
  TimeProportion,
  DayLabel,
  SPLabel,
  Mutation,
  Query
};

export default resolvers;
