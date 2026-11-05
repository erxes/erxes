import { defineExtension } from 'erxes-sdk/server';
import { collections } from './connectionResolver';
import { responseTemplateMutations } from './graphql/responseTemplateMutations';
import { responseTemplateQueries } from './graphql/responseTemplateQueries';
import { mutations, queries, types } from './graphql/schema';
import { permissions } from './meta/permissions';

export const extension = defineExtension({
  types,
  queries,
  mutations,
  resolvers: {
    Query: responseTemplateQueries,
    Mutation: responseTemplateMutations,
  },
  collections,
  // One template per imported frontline template, so a second import can't
  // copy it twice. Sparse: templates written here have no sourceId.
  indexes: {
    ResponseTemplates: [{ keys: { sourceId: 1 }, unique: true, sparse: true }],
  },
  permissions,
  fieldPermissions: {
    responseTemplatesList: 'responseTemplates.view',
    responseTemplatesDetail: 'responseTemplates.view',
    responseTemplatesChannels: 'responseTemplates.view',
    responseTemplatesComposerChannel: 'responseTemplates.view',
    responseTemplatesAdd: 'responseTemplates.add',
    responseTemplatesEdit: 'responseTemplates.edit',
    responseTemplatesRemove: 'responseTemplates.remove',
    responseTemplatesImportFromFrontline: 'responseTemplates.add',
  },
});
