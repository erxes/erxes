import activityLogs from './activityLogs';
import automations from './automations';
import boards from './boards';
import brands from './brands';
import calendars from './calendars';
import channels from './channels';
import checklists from './checklists';
import clientPortal from './clientPortal';
import companies from './companies';
import configs from './configs';
import conversations from './conversations';
import customers from './customers';
import dashboards from './dashboards';
import deals from './deals';
import emailDeliveries from './emailDelivery';
import emailTemplates from './emailTemplates';
import {
  fieldQueries as fields,
  fieldsGroupQueries as fieldsgroups
} from './fields';
import forms from './forms';
import growthHack from './growthHacks';
import importHistory from './importHistory';
import integrations from './integrations';
import internalNotes from './internalNotes';
import knowledgeBase from './knowledgeBase';
import logs from './logs';
import messengerAppsQueries from './messengerApps';
import notifications from './notifications';
import {
  permissionQueries as permissions,
  usersGroupQueries as usersGroups
} from './permissions';
import pipelineLabels from './pipelineLabels';
import pipelineTemplates from './pipelineTemplates';
import products from './products';
import responseTemplates from './responseTemplates';
import robot from './robot';
import scripts from './scripts';
import segments from './segments';
import { skillQueries, skillTypesQueries } from './skills';
import tags from './tags';
import tasks from './tasks';
import tickets from './tickets';
import users from './users';
import webhooks from './webhooks';
import widgets from './widgets';
import smsDeliveries from './smsDeliveries';
import structures from './structures';

export default {
  ...users,
  ...channels,
  ...brands,
  ...integrations,
  ...fields,
  ...responseTemplates,
  ...scripts,
  ...emailTemplates,
  ...emailDeliveries,
  ...forms,
  ...tags,
  ...internalNotes,
  ...customers,
  ...companies,
  ...segments,
  ...conversations,
  ...knowledgeBase,
  ...notifications,
  ...activityLogs,
  ...deals,
  ...boards,
  ...products,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...tickets,
  ...tasks,
  ...logs,
  ...growthHack,
  ...pipelineTemplates,
  ...checklists,
  ...robot,
  ...pipelineLabels,
  ...widgets,
  ...webhooks,
  ...calendars,
  ...dashboards,
  ...skillTypesQueries,
  ...skillQueries,
  ...clientPortal,
  ...messengerAppsQueries,
  ...smsDeliveries,
  ...structures,
  ...automations
};
