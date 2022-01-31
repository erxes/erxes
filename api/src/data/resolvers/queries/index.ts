import brands from './brands';
import configs from './configs';
import {
  fieldQueries as fields,
  fieldsGroupQueries as fieldsgroups
} from './fields';
import forms from './forms';
import importHistory from './importHistory';
import {
  permissionQueries as permissions,
  usersGroupQueries as usersGroups
} from './permissions';
import robot from './robot';
import segments from './segments';
import users from './users';
import smsDeliveries from './smsDeliveries';
import structures from './structures';

export default {
  ...users,
  ...brands,
  ...fields,
  ...forms,
  ...segments,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...smsDeliveries,
  ...structures
};
