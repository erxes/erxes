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
import * as _ from 'lodash';

export default function genResolvers(plugins: any[]) {
  const pluginResolvers = plugins.map(plugin => plugin.generateResolvers(graphqlPubsub));

  const Subscription: any = {
    ...(_.merge({}, ...pluginResolvers)),
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

  return {
    Subscription,
  };
}