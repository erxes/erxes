import { db } from '@erxes/core-db';
import { createTag, listTags, removeTag, updateTag } from '~/modules/tags/tags.service';
import { authed, audited, recordOf } from '~/orpc';

export const tagsRouter = {
  list: authed.tags.list.handler(({ input }) => listTags(db(), input)),
  create: authed.tags.create.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => createTag(tx, context.actor, input),
      (tag) => recordOf('tag', 'created', tag.id, tag),
    ),
  ),
  update: authed.tags.update.handler(({ input: { id, ...changes }, context }) =>
    audited(
      context.actor,
      (tx) => updateTag(tx, id, changes),
      (tag) => ({ ...recordOf('tag', 'updated', id, tag), metadata: changes }),
    ),
  ),
  remove: authed.tags.remove.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => removeTag(tx, context.actor, input.id),
      () => recordOf('tag', 'deleted', input.id),
    ),
  ),
};
