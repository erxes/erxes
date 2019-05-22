import activityLogs from './activityLogs';
import conversations from './conversations';
import deals from './deals';
import './engages';
import gmail from './gmail';

export default {
  ...conversations,
  ...activityLogs,
  ...gmail,
  ...deals,
};
