import customScalars from '@erxes/api-utils/src/customScalars';
import ActivityLogQueries from './activityLogQueries';
import LogQueries from './logQueries';
import ActivityLog from './activityLog';
import ActivityLogByAction from './activityLogByAction';
import EmailDevliveryQueries from './emailDeliveryQueries';

const resolvers: any = {
  ...customScalars,
  ActivityLog,
  ActivityLogByAction,
  Query: {
    ...LogQueries,
    ...ActivityLogQueries,
    ...EmailDevliveryQueries
  },
};

export default resolvers;
