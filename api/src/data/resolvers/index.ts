import * as permissionActions from '../permissions/actions';
import Brand from './brand';
import customScalars from './customScalars';
import EmailDelivery from './emailDeliveries';
import { field, fieldsGroup } from './field';
import Form from './forms';
import ImportHistory from './importHistory';
import Mutation from './mutations';
import Permission from './permission';
import Query from './queries';
import Segment from './segment';
import Subscription from './subscriptions';
import User from './user';
import UsersGroup from './usersGroup';
import Trigger from './trigger';
import Structure from './structure';
import Department from './departments';
import Unit from './units';
import Branch from './branches';

const resolvers: any = {
  ...customScalars,
  ...permissionActions,

  Brand,
  Segment,
  EmailDelivery,

  Mutation,
  Query,
  Subscription,

  Form,
  FieldsGroup: fieldsGroup,
  Field: field,
  User,
  ImportHistory,
  Permission,
  UsersGroup,
  Trigger,
  Structure,
  Department,
  Unit,
  Branch
};

export default resolvers;
