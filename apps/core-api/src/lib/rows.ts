/**
 * The row an insert's or update's `returning()` gave back. Callers have
 * already checked the row exists, so a missing one is a bug, not a client error.
 */
export const oneRow = <T>(rows: T[]) => {
  const [row] = rows;

  if (row === undefined) throw new Error('Expected the statement to return a row');

  return row;
};
