import customScalars from '@erxes/api-utils/src/customScalars';
import NotificationMutations from './notificationMutations';
import NotificationQueries from './notificationQueries';
import Notification from './notification';

const resolvers: any = {
  ...customScalars,
  Notification,
  Mutation: {
    ...NotificationMutations,
  },
  Query: {
    ...NotificationQueries,
  },
};

export default resolvers;
