import { RowSelectionState } from '@tanstack/react-table';

export const omitRowSelection =
  (ids: string[]) =>
  (selection: RowSelectionState): RowSelectionState => {
    const next = { ...selection };
    ids.forEach((id) => {
      delete next[id];
    });
    return next;
  };
