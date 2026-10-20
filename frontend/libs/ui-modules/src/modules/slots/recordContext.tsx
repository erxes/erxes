import { createContext, useContext } from 'react';
import type { RecordContentType } from 'erxes-ui';

type RecordContextValue = { contentType: string; contentId: string };

const RecordContext = createContext<RecordContextValue | null>(null);

/** Given by the host around a record side tab it renders. */
export const RecordContextProvider = RecordContext.Provider;

/** The record whose side tab this is, e.g. `{ contentType: 'sales:deal', contentId }`. */
export const useRecordContext = () => {
  const value = useContext(RecordContext);

  if (!value) {
    throw new Error('useRecordContext must be used inside a record side tab');
  }

  return value;
};

type RecordSelectionValue = {
  contentType: RecordContentType;
  contentIds: string[];
};

const RecordSelectionContext = createContext<RecordSelectionValue | null>(
  null,
);

export const RecordSelectionProvider = RecordSelectionContext.Provider;

/**
 * The records a record action acts on: the open record on a detail page, the
 * selected rows in a bulk bar.
 */
export const useRecordSelection = () => {
  const value = useContext(RecordSelectionContext);

  if (!value) {
    throw new Error('useRecordSelection must be used inside a record action');
  }

  return value;
};
