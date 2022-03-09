import brands from './brands';
import configs from './configs';
import conformity from './conformities';
import importHistory from './importHistory';
import {
  permissionMutations as permissions,
  usersGroupMutations as usersGroups
} from './permissions';
import robot from './robot';
import users from './users';
import structures from './structures';

export default {
  ...users,
  ...brands,
  ...configs,
  ...conformity,
  ...importHistory,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...structures
};
