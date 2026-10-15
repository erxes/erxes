import type { IMessage } from '@/inbox/types/Conversation';

export const mergeMailInternalNotes = <
  T extends Pick<IMessage, '_id' | 'createdAt'>,
>(
  previous: T[],
  incoming: T[],
): T[] => {
  const notesById = new Map(previous.map((note) => [note._id, note]));
  for (const note of incoming) notesById.set(note._id, note);

  return [...notesById.values()].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime() ||
      (left._id < right._id ? -1 : Number(left._id > right._id)),
  );
};
