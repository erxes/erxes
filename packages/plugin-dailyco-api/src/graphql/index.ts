import resolvers from './resolvers';
import typeDefs from './typeDefs';
import { DocumentNode } from 'graphql';

const mod: { resolvers: any; typeDefs: DocumentNode } = {
  resolvers,
  typeDefs
};

export default mod;
