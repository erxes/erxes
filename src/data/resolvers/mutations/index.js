import users from './users';
import conversations from './conversations';
import tags from './tags';
import engages from './engages';
import brands from './brands';
import internalNotes from './internalNotes';
import customers from './customers';
import segments from './segments';
import companies from './companies';
import { fieldMutations as fields, fieldsGroupsMutations as fieldsgroups } from './fields';
import emailTemplates from './emailTemplates';
import responseTemplates from './responseTemplates';
import channels from './channels';
import forms from './forms';
import integrations from './integrations';
import notifications from './notifications';
import knowledgeBase from './knowledgeBase';
import activityLogs from './activityLogs';

export default {
  ...users,
  ...conversations,
  ...tags,
  ...engages,
  ...brands,
  ...internalNotes,
  ...customers,
  ...segments,
  ...companies,
  ...fields,
  ...emailTemplates,
  ...responseTemplates,
  ...channels,
  ...forms,
  ...integrations,
  ...notifications,
  ...knowledgeBase,
  ...activityLogs,
  ...fieldsgroups,
};
