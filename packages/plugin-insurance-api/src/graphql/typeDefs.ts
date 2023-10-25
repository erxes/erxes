import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import * as path from 'path';

const typeDefs = async _serviceDiscovery => {
  const types = loadFilesSync(path.join(__dirname, 'schema'), {
    extensions: ['graphql', 'gql']
  });

  return mergeTypeDefs(types);
};

export default typeDefs;
