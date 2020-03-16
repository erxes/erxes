import activityLogs from './activityLogs';
import automations from './automations';
import checklists from './checklists';
import conversations from './conversations';
import customers from './customers';
import deals from './deals';
import growthHacks from './growthHacks';
import importHistory from './importHistory';
import notifications from './notifications';
import pipelines from './pipelines';
import robot from './robot';
import tasks from './tasks';
import tickets from './tickets';

let subscriptions: any = {
  ...conversations,
  ...customers,
  ...activityLogs,
  ...importHistory,
  ...notifications,
  ...automations,
  ...robot,
  ...deals,
  ...tasks,
  ...tickets,
  ...checklists,
  ...growthHacks,
  ...pipelines,
};

const { NODE_ENV } = process.env;

// disable subscriptions in test mode
if (NODE_ENV === 'test') {
  subscriptions = {};
}

export default subscriptions;
