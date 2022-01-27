import * as dotenv from 'dotenv';

dotenv.config();

import graphqlPubsub from '../pubsub';
import * as _ from 'lodash';

export default function genResolvers(plugins: any[]) {
  const pluginResolversArray = plugins.map(plugin =>
    plugin.generateResolvers(graphqlPubsub)
  );
  const pluginResolvers = _.merge({}, ...pluginResolversArray);

  const Subscription: any = {
    ...pluginResolvers,
  };

  return {
    Subscription
  };
}
