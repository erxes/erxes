import type { IContext } from '../connectionResolver';

export const noteQueries = {
  /** The newest 100 notes. */
  async extTemplateNotes(
    _parent: undefined,
    _args: Record<string, never>,
    { db }: IContext,
  ) {
    return db.Notes.find({}, { sort: { createdAt: -1 }, limit: 100 });
  },
};
