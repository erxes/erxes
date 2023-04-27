import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';
import queries from './queries';
import Schedule from './schedule';
import Absence from './absence';
import Timeclock from './timeclock';
import UserReport from './report';
import ScheduleConfig from './scheduleConfig';
import Timelog from './timelog';
import DuplicateSchedule from './duplicateSchedule';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  UserReport,
  Schedule,
  DuplicateSchedule,
  Absence,
  Timeclock,
  ScheduleConfig,
  Timelog,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
