export const mergeMailInternalNotes = <
  T extends { _id: string; createdAt?: string | null },
>(
  previous: T[],
  incoming: T[],
): T[] => {
  const notesById = new Map(previous.map((note) => [note._id, note]));
  for (const note of incoming) notesById.set(note._id, note);

  return [...notesById.values()].sort(
    (left, right) =>
      new Date(left.createdAt ?? 0).getTime() -
        new Date(right.createdAt ?? 0).getTime() ||
      (left._id < right._id ? -1 : Number(left._id > right._id)),
  );
};
