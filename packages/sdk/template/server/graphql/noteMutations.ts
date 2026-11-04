import { ExtensionError } from 'erxes-sdk/server';
import type { IContext } from '../connectionResolver';
import { NoteInput } from '../db/definitions/notes';

export const noteMutations = {
  async extTemplateNotesAdd(
    _parent: undefined,
    args: { text: string },
    { db, user }: IContext,
  ) {
    const { insertedId } = await db.Notes.insertOne({
      ...NoteInput.parse(args),
      createdBy: user._id,
    });
    const note = await db.Notes.findOne({ _id: insertedId });

    if (!note) {
      throw new ExtensionError('NOT_FOUND', 'Note not found');
    }

    return note;
  },
};
