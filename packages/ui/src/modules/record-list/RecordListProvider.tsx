import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { z } from 'zod';
import { storedFamily } from '../../lib/stored';
import { rowsBetween, withRows } from './selection';

/** The groups folded away, per list, kept in this browser. */
export const collapsedGroups = storedFamily({
  key: 'erxes:record-list:collapsed',
  schema: z.array(z.string().max(200)).max(500),
  initial: [],
});

interface RecordListContextValue {
  listId: string;
  selected: ReadonlySet<string>;
  /** With `order` (the rows as shown), a shift-click: every row since the last click. */
  toggle: (id: string, order?: readonly string[]) => void;
  /** Picks all of `ids`, or clears them when all are picked. */
  toggleAll: (ids: readonly string[]) => void;
  clear: () => void;
}

const RecordListContext = createContext<RecordListContextValue | null>(null);

export const useRecordListContext = () => {
  const context = useContext(RecordListContext);

  if (!context) throw new Error('A record list must be used within RecordList.Provider.');

  return context;
};

/**
 * The selection a record list and its command bar share. Rows that leave the list stay
 * picked until `clear`, so read the selection through the rows the page shows.
 */
export const useRecordListSelection = () => {
  const { selected, toggle, toggleAll, clear } = useRecordListContext();

  return {
    ids: [...selected],
    has: (id: string) => selected.has(id),
    toggle: (id: string) => toggle(id),
    toggleAll,
    clear,
  };
};

/** `listId` names the list in this browser, where its folded groups are kept. */
export const RecordListProvider = ({ listId, children }: PropsWithChildren<{ listId: string }>) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);

  const context = useMemo<RecordListContextValue>(
    () => ({
      listId,
      selected,
      toggle: (id, order) => {
        const rows = order ? rowsBetween(order, anchor, id) : [id];

        setSelected(withRows(selected, rows, !selected.has(id)));
        setAnchor(id);
      },
      toggleAll: (ids) =>
        setSelected(withRows(selected, ids, !ids.every((id) => selected.has(id)))),
      clear: () => {
        setSelected(new Set());
        setAnchor(null);
      },
    }),
    [listId, selected, anchor],
  );

  return <RecordListContext.Provider value={context}>{children}</RecordListContext.Provider>;
};
