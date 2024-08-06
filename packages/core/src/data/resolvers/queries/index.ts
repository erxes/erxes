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
  ...forms
};
