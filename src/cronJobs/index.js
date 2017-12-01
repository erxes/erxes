import conversations from './conversations';
import activityLogs from './activityLogs';
import sendAutoMessage from './engages';

export default {
  ...conversations,
  ...activityLogs,
  ...sendAutoMessage,
};
