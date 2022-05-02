import customScalars from '@erxes/api-utils/src/customScalars';
import { Webhooks as WebhookMutations } from './mutations';
import { Webhooks as WebhookQueries } from './queries';

const resolvers = (_serviceDiscovery) => (
  {
    ...customScalars,

    Mutation: {
      ...WebhookMutations
    },
    Query: {
      ...WebhookQueries
    }
  }
)


export default resolvers;