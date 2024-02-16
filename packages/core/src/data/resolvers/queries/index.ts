import brands from './brands';
import configs from './configs';
import {
  permissionQueries as permissions,
  usersGroupQueries as usersGroups,
} from './permissions';
import robot from './robot';
import users from './users';
import structures from './structures';
import apps from './apps';
import charge from './charge';
import plugins from './plugins';
import organizations from './organizations';

export default {
  ...users,
  ...brands,
  ...configs,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...structures,
  ...apps,
  ...charge,
  ...plugins,
  ...organizations,
};
