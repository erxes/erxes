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
import insights from './insights';
import integrations from './integrations';
import internalNotes from './internalNotes';
import knowledgeBase from './knowledgeBase';
import notifications from './notifications';
import products from './products';
import responseTemplates from './responseTemplates';
import segments from './segments';
import tags from './tags';
import users from './users';

export default {
  ...users,
  ...channels,
  ...brands,
  ...integrations,
  ...fields,
  ...responseTemplates,
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
  ...products,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
};
