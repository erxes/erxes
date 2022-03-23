import brands from './brands';
import configs from './configs';
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
  ...configs,
  ...permissions,
  ...usersGroups,
  ...robot,
  ...structures,
  ...emailDeliveries
};
