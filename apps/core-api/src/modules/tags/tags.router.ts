import { db } from '@erxes/core-db';
import { createTag, listTags, removeTag, updateTag } from '~/modules/tags/tags.service';
import { scoped, audited, recordOf } from '~/orpc';

export const tagsRouter = {
  list: scoped.tags.list.handler(({ input }) => listTags(db(), input)),
  create: scoped.tags.create.handler(({ input }) =>
    audited(
      (tx) => createTag(tx, input),
      (tag) => recordOf('tag', 'created', tag.id, tag),
    ),
  ),
  update: scoped.tags.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateTag(tx, id, changes),
      (tag) => ({ ...recordOf('tag', 'updated', id, tag), metadata: changes }),
    ),
  ),
  remove: scoped.tags.remove.handler(({ input }) =>
    audited(
      (tx) => removeTag(tx, input.id),
      () => recordOf('tag', 'deleted', input.id),
    ),
  ),
};
