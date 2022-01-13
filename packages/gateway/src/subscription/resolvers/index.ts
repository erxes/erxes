import * as dotenv from "dotenv";
dotenv.config();

import activityLogs from "./activityLogs";
import calendars from "./calendars";
import checklists from "./checklists";
import conversations from "./conversations";
import customers from "./customers";
import importHistory from "./importHistory";
import notifications from "./notifications";
import pipelines from "./pipelines";
import robot from "./robot";
import users from "./users";
import graphqlPubsub from "../pubsub";
import { Channels, Conversations, Integrations } from "../../db";

const { SUBGRAPH_INBOX_URL } = process.env;

const Subscription: any = {
  ...(SUBGRAPH_INBOX_URL
    ? conversations({ Channels, Conversations, Integrations, graphqlPubsub })
    : {}),
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
