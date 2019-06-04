import activityLogs from './activityLogs';
import conversations from './conversations';
import deals from './deals';
import './engages';

export default {
  ...conversations,
  ...activityLogs,
  ...deals,
};
