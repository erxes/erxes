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
import users from './users';
import structures from './structures';
import emailDeliveries from './emailDeliveries';

export default {
  ...users,
  ...brands,
  ...fields,
  ...forms,
  ...configs,
  ...fieldsgroups,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...structures,
  ...emailDeliveries
};
