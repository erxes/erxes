import customScalars from '@erxes/api-utils/src/customScalars';

import { EmailTemplates as EmailTemplateMutations } from './mutations';

import { EmailTemplates as EmailTemplateQueries } from './queries';

import EmailTemplate from './emailTemplates';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  EmailTemplate,

  Mutation: {
    ...EmailTemplateMutations
  },
  Query: {
    ...EmailTemplateQueries
  }
});

export default resolvers;
