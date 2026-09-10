import * as dotenv from 'dotenv';

dotenv.config();

import graphqlPubsub from '../pubsub';
import * as _ from 'lodash';
import activityLogs from './activityLogs';
import segments from './segments';
import users from './users';

export default function genResolvers(plugins: any[]) {
  const pluginResolversArray = plugins.map((plugin) => {
    // Access generateResolvers from the default export
    const pluginModule = plugin.default || plugin;
    return pluginModule.generateResolvers(graphqlPubsub);
  });

  const pluginResolvers = _.merge({}, ...pluginResolversArray);

  const Subscription: any = {
    ...pluginResolvers,
    ...activityLogs,
    ...segments,
    ...users,
  };

  return {
    Subscription,
  };
}
