import brands from './brands';
import configs from './configs';
import conformity from './conformities';
import {
  fieldMutations as fields,
  fieldsGroupsMutations as fieldsgroups
} from './fields';
import forms from './forms';
import importHistory from './importHistory';
import {
  permissionMutations as permissions,
  usersGroupMutations as usersGroups
} from './permissions';
import products from './products';
import robot from './robot';
import segments from './segments';
import users from './users';
import structures from './structures';

export default {
  ...users,
  ...brands,
  ...segments,
  ...fields,
  ...forms,
  ...products,
  ...configs,
  ...conformity,
  ...fieldsgroups,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...structures
};
