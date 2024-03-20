import { IDashboardDocument } from './../../models/definitions/insight';
import customScalars from '@erxes/api-utils/src/customScalars';
import { IContext } from '../../connectionResolver';
import customResolvers from './customResolvers';

import {
  Dashboards as DashboardMutations,
  Reports as ReportMutations,
  Sections as SectionMutations,
  Charts as ChartMutations,
} from './mutations';
import {
  Insights as InsightQueries,
  Dashboards as DashboardQueries,
  Reports as ReportQueries,
  Sections as SectionQueries,
} from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  ...customResolvers,

  Mutation: {
    ...DashboardMutations,
    ...ReportMutations,
    ...SectionMutations,
    ...ChartMutations,
  },
  Query: {
    ...InsightQueries,
    ...DashboardQueries,
    ...ReportQueries,
    ...SectionQueries,
  },
});

export default resolvers;
