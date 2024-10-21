import Brand from "./brand";
import customScalars from "./customScalars";
import Mutation from "./mutations";
import Permission from "./permission";
import Query from "./queries";
import Subscription from "./subscriptions";
import User from "./user";
import UsersGroup from "./usersGroup";
import Structure from "./structure";
import Department from "./departments";
import Unit from "./units";
import Branch from "./branches";
import App from "./app";
import UserMovement from "./userMovements";
import Position from "./positions";
import Tag from "./tags";
import InternalNote from "./internalNote";
import ActivityLog from "./activityLog";
import ActivityLogByAction from "./activityLogByAction";
import Segment from "./segments";
import { field as Field, fieldsGroup as FieldsGroup } from "./field";
import Submission from "./submission";
import Form from "./forms";
import Customer from "./customer";
import Company from "./company";
import Product from "./product";
import ProductCategory from "./productCategory";
import Uom from "./uom";
import EmailTemplate from "./emailTemplates";
import Dashboard from "./dashboard";
import Report from "./report";
import Section from "./section";
import Insight from "./insight";

const resolvers: any = {
  ...customScalars,

  Brand,

  Mutation,
  Query,
  Subscription,

  Tag,
  User,
  Permission,
  UsersGroup,
  Structure,
  Department,
  Unit,
  Branch,
  App,
  UserMovement,
  Position,
  InternalNote,
  ActivityLog,
  ActivityLogByAction,
  Segment,
  Field,
  Form,
  FieldsGroup,
  Submission,
  Customer,
  Company,
  Product,
  ProductCategory,
  Uom,
  EmailTemplate,
  Dashboard,
  Report,
  Section,
  Insight
};

export default resolvers;
