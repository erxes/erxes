import accounts from './accounts';
import activityLogs from './activityLogs';
import brands from './brands';
import channels from './channels';
import companies from './companies';
import configs from './configs';
import conversations from './conversations';
import customers from './customers';
import deals from './deals';
import emailTemplates from './emailTemplates';
import engages from './engages';
import { fieldQueries as fields, fieldsGroupQueries as fieldsgroups } from './fields';
import forms from './forms';
import importHistory from './importHistory';
import insightExport from './insightExport';
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
import users from './users';

export default {
  ...accounts,
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
  ...insightExport,
  ...knowledgeBase,
  ...notifications,
  ...activityLogs,
  ...deals,
  ...products,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
  ...messengerApps,
  ...permissions,
  ...usersGroups,
};
