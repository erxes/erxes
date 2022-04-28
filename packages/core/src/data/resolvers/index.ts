import * as permissionActions from '../permissions/actions';
import Brand from './brand';
import customScalars from './customScalars';
import Mutation from './mutations';
import Permission from './permission';
import Query from './queries';
import Subscription from './subscriptions';
import User from './user';
import UsersGroup from './usersGroup';
import Structure from './structure';
import Department from './departments';
import Unit from './units';
import Branch from './branches';
import App from './app';

const resolvers: any = {
  ...customScalars,
  ...permissionActions,

  Brand,

  Mutation,
  Query,
  Subscription,

  User,
  Permission,
  UsersGroup,
  Structure,
  Department,
  Unit,
  Branch,
  App
};

export default resolvers;
