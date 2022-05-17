import customScalars from '@erxes/api-utils/src/customScalars';

import { EmailTemplates as EmailTemplateMutations } from './mutations';

import { EmailTemplates as EmailTemplateQueries } from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,

  Mutation: {
    ...EmailTemplateMutations
  },
  Query: {
    ...EmailTemplateQueries
  }
});

export default resolvers;
