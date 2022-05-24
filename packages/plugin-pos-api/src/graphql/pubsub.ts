import * as dotenv from 'dotenv';
import { PubSub } from 'graphql-subscriptions';

// load environment variables
dotenv.config();

const createPubsubInstance = () => {
  return new PubSub();
};

export const graphqlPubsub = createPubsubInstance();
