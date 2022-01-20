import * as dotenv from 'dotenv';
dotenv.config();

const { NODE_ENV } = process.env;

import getPluginConfigs from './plugins/getPluginConfigs'
import genTypeDefs from './genTypeDefs';
import genResolvers from './resolvers/genResolvers';
import { DocumentNode } from 'graphql';

export default async function genTypeDefsAndResolvers(): Promise<{ typeDefs: DocumentNode, resolvers: any }> {
    const plugins = await getPluginConfigs();
    const typeDefs = genTypeDefs(plugins);
    const resolvers = genResolvers(plugins);
    return { typeDefs, resolvers };
}