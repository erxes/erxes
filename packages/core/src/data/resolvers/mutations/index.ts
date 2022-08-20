import brands from './brands';
import configs from './configs';
import conformity from './conformities';
import {
  permissionMutations as permissions,
  usersGroupMutations as usersGroups
} from './permissions';
import robot from './robot';
import users from './users';
import structures from './structures';
import apps from './apps';

export default {
  ...users,
  ...brands,
  ...configs,
  ...conformity,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...structures,
  ...apps
};
