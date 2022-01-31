import brands from './brands';
import configs from './configs';
import conformity from './conformities';
import emailTemplates from './emailTemplates';
import {
  fieldMutations as fields,
  fieldsGroupsMutations as fieldsgroups
} from './fields';
import forms from './forms';
import importHistory from './importHistory';
import internalNotes from './internalNotes';
import {
  permissionMutations as permissions,
  usersGroupMutations as usersGroups
} from './permissions';
import products from './products';
import robot from './robot';
import segments from './segments';
import tags from './tags';
import users from './users';
import webhooks from './webhooks';
import structures from './structures';

export default {
  ...users,
  ...tags,
  ...brands,
  ...internalNotes,
  ...segments,
  ...fields,
  ...emailTemplates,
  ...forms,
  ...products,
  ...configs,
  ...conformity,
  ...fieldsgroups,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...webhooks,
  ...structures
};
