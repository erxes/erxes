import brands from "./brands";
import configs from "./configs";
import {
  permissionQueries as permissions,
  usersGroupQueries as usersGroups
} from "./permissions";
import robot from "./robot";
import users from "./users";
import structures from "./structures";
import apps from "./apps";
import charge from "./charge";
import plugins from "./plugins";
import organizations from "./organizations";
import tags from "./tags";
import internalNotes from "./internalNotes";
import activityLogs from "./activityLogs";
import emailDeliveries from "./emailDeliveries";
import logs from "./logs";
import segments from "./segments";
import {
  fieldQueries as fields,
  fieldsGroupQueries as fieldsgroups
} from "./fields";
import forms from "./forms";
import company from "./company";
import customer from "./customer";
import contact from "./contact";
import products from "./products";
import productConfigs from "./productConfigs";
import uoms from "./uoms";
import emailTemplates from "./emailTemplates";
import dashboards from "./dashboard";
import reports from "./report";
import sections from "./section";
import insights from "./insight";

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
  ...tags,
  ...internalNotes,
  ...activityLogs,
  ...emailDeliveries,
  ...logs,
  ...segments,
  ...fields,
  ...fieldsgroups,
  ...forms,
  ...company,
  ...customer,
  ...contact,
  ...products,
  ...productConfigs,
  ...uoms,
  ...emailTemplates,
  ...dashboards,
  ...reports,
  ...sections,
  ...insights
};
