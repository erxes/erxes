import activityLogs from './activityLogs';
import boards from './boards';
import brands from './brands';
import channels from './channels';
import companies from './companies';
import configs from './configs';
import conversations from './conversations';
import customers from './customers';
import dealInsights from './dealInsights';
import deals from './deals';
import emailTemplates from './emailTemplates';
import engages from './engages';
import { fieldQueries as fields, fieldsGroupQueries as fieldsgroups } from './fields';
import forms from './forms';
import importHistory from './importHistory';
import insights from './insights';
import integrations from './integrations';
import internalNotes from './internalNotes';
import knowledgeBase from './knowledgeBase';
import messengerApps from './messengerApps';
import notifications from './notifications';
import { permissionQueries as permissions, usersGroupQueries as usersGroups } from './permissions';
import products from './products';
import responseTemplates from './responseTemplates';
import scripts from './scripts';
import segments from './segments';
import tags from './tags';
import tasks from './tasks';
import tickets from './tickets';
import users from './users';

export default {
  ...users,
  ...channels,
  ...brands,
  ...integrations,
  ...fields,
  ...responseTemplates,
  ...scripts,
  ...emailTemplates,
  ...engages,
  ...forms,
  ...tags,
  ...internalNotes,
  ...customers,
  ...companies,
  ...segments,
  ...conversations,
  ...insights,
  ...knowledgeBase,
  ...notifications,
  ...activityLogs,
  ...deals,
  ...boards,
  ...dealInsights,
  ...products,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
  ...messengerApps,
  ...permissions,
  ...usersGroups,
  ...tickets,
  ...tasks,
};
