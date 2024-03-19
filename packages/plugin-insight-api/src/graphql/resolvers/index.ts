import { IDashboardDocument } from './../../models/definitions/insight';
import customScalars from '@erxes/api-utils/src/customScalars';
import { IContext } from '../../connectionResolver';
import customResolvers from './customResolvers';

import {
  Dashboards as DashboardMutations,
  Sections as SectionMutations,
  Charts as ChartMutations,
} from './mutations';
import {
  Dashboards as DashboardQueries,
  Sections as SectionQueries,
} from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  ...customResolvers,

  Mutation: {
    ...DashboardMutations,
    ...SectionMutations,
    ...ChartMutations,
  },
  Query: {
    ...DashboardQueries,
    ...SectionQueries,
  },
});

export default resolvers;
