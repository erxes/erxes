import customScalars from '@erxes/api-utils/src/customScalars';
import ActivityLogQueries from './activityLogQueries';
import LogQueries from './logQueries';
import ActivityLog from './activityLog';
import ActivityLogByAction from './activityLogByAction';

const resolvers: any = {
  ...customScalars,
  ActivityLog,
  ActivityLogByAction,
  Query: {
    ...LogQueries,
    ...ActivityLogQueries,
  },
};

export default resolvers;