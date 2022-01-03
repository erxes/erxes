import activityLogs from './activityLogs';
import calendars from './calendars';
import checklists from './checklists';
import conversations from './conversations';
import customers from './customers';
import importHistory from './importHistory';
import notifications from './notifications';
import pipelines from './pipelines';
import robot from './robot';
import users from './users';

const Subscription: any = {
  ...conversations,
  ...customers,
  ...activityLogs,
  ...importHistory,
  ...notifications,
  ...robot,
  ...checklists,
  ...pipelines,
  ...calendars,
  ...users
};

const resolvers = {
  Subscription
}


export default resolvers;
