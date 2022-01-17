import * as dotenv from "dotenv";

dotenv.config();

import activityLogs from "./activityLogs";
import calendars from "./calendars";
import checklists from "./checklists";
import customers from "./customers";
import importHistory from "./importHistory";
import notifications from "./notifications";
import pipelines from "./pipelines";
import robot from "./robot";
import users from "./users";
import graphqlPubsub from "../pubsub";

import plugins from "../../plugins";

let pluginResolvers = {};

for (const plugin of plugins) {
  const plResolvers = plugin.generateResolvers(graphqlPubsub);

  pluginResolvers  = { ...pluginResolvers, ...plResolvers };
}

const Subscription: any = {
  ...pluginResolvers,
  ...customers,
  ...activityLogs,
  ...importHistory,
  ...notifications,
  ...robot,
  ...checklists,
  ...pipelines,
  ...calendars,
  ...users,
};

const resolvers = {
  Subscription,
};

export default resolvers;
