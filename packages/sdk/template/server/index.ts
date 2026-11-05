import { defineExtension } from 'erxes-sdk/server';
import { collections } from './connectionResolver';
import { noteMutations } from './graphql/noteMutations';
import { noteQueries } from './graphql/noteQueries';
import { mutations, queries, types } from './graphql/schema';
import { permissions } from './meta/permissions';

export const extension = defineExtension({
  types,
  queries,
  mutations,
  resolvers: { Query: noteQueries, Mutation: noteMutations },
  collections,
  indexes: { Notes: [{ keys: { createdAt: -1 } }] },
  permissions,
  // Every root field, and the permission it needs.
  fieldPermissions: {
    extTemplateNotes: 'notes.view',
    extTemplateNotesAdd: 'notes.add',
  },
});
