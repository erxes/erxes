import brands from './brands';
import configs from './configs';
import emailDeliveries from './emailDelivery';
import {
  fieldQueries as fields,
  fieldsGroupQueries as fieldsgroups
} from './fields';
import forms from './forms';
import importHistory from './importHistory';
import internalNotes from './internalNotes';
import {
  permissionQueries as permissions,
  usersGroupQueries as usersGroups
} from './permissions';
import products from './products';
import robot from './robot';
import segments from './segments';
import tags from './tags';
import users from './users';
import webhooks from './webhooks';
import smsDeliveries from './smsDeliveries';
import structures from './structures';

export default {
  ...users,
  ...brands,
  ...fields,
  ...emailDeliveries,
  ...forms,
  ...tags,
  ...internalNotes,
  ...segments,
  ...products,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...webhooks,
  ...smsDeliveries,
  ...structures
};
