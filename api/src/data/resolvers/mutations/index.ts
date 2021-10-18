import automationsMutations from './automations';
import boards from './boards';
import brands from './brands';
import calendars from './calendars';
import channels from './channels';
import checklists from './checklists';
import clientPortal from './clientPortal';
import companies from './companies';
import configs from './configs';
import conformity from './conformities';
import conversations from './conversations';
import customers from './customers';
import dashboards from './dashboards';
import deals from './deals';
import emailTemplates from './emailTemplates';
import engages from './engages';
import {
  fieldMutations as fields,
  fieldsGroupsMutations as fieldsgroups
} from './fields';
import forms from './forms';
import growthHacks from './growthHacks';
import importHistory from './importHistory';
import integrations from './integrations';
import internalNotes from './internalNotes';
import knowledgeBase from './knowledgeBase';
import messengerApps from './messengerApps';
import notifications from './notifications';
import {
  permissionMutations as permissions,
  usersGroupMutations as usersGroups
} from './permissions';
import pipelineLabels from './pipelineLabels';
import pipelineTemplates from './pipelineTemplates';
import products from './products';
import responseTemplates from './responseTemplates';
import robot from './robot';
import scripts from './scripts';
import segments from './segments';
import { skillsMutations, skillTypesMutations } from './skills';
import tags from './tags';
import tasks from './tasks';
import tickets from './tickets';
import users from './users';
import webhooks from './webhooks';
import widgets from './widgets';

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
  ...scripts,
  ...channels,
  ...forms,
  ...integrations,
  ...notifications,
  ...knowledgeBase,
  ...deals,
  ...boards,
  ...products,
  ...configs,
  ...conformity,
  ...fieldsgroups,
  ...importHistory,
  ...messengerApps,
  ...permissions,
  ...usersGroups,
  ...tickets,
  ...tasks,
  ...growthHacks,
  ...pipelineLabels,
  ...pipelineTemplates,
  ...checklists,
  ...robot,
  ...widgets,
  ...webhooks,
  ...calendars,
  ...dashboards,
  ...skillTypesMutations,
  ...skillsMutations,
  ...clientPortal,
  ...automationsMutations
};
