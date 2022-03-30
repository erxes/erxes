import * as dotenv from "dotenv";
dotenv.config();

import getPluginConfigs from "./plugins/getPluginConfigs";
import genTypeDefs from "./genTypeDefs";
import genResolvers from "./resolvers/genResolvers";
import { DocumentNode } from "graphql";

export default async function genTypeDefsAndResolvers(): Promise<{
  typeDefs: DocumentNode;
  resolvers: any;
} | null> {
  const plugins = await getPluginConfigs();

  if(!plugins?.length) { return null; }

  const typeDefs = genTypeDefs(plugins);
  const resolvers = genResolvers(plugins);

  return { typeDefs, resolvers };
}
