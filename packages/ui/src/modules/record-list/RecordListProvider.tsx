import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { z } from 'zod';
import { storedFamily } from '../../lib/stored';
import { createSelection, type Selection } from './selection';

/** The groups folded away, per list, kept in this browser. */
export const collapsedGroups = storedFamily({
  key: 'erxes:record-list:collapsed',
  schema: z.array(z.string().max(200)).max(500),
  initial: [],
});

interface RecordListContextValue {
  listId: string;
  selection: Selection;
}

const RecordListContext = createContext<RecordListContextValue | null>(null);

export const useRecordListContext = () => {
  const context = useContext(RecordListContext);

  if (!context) throw new Error('A record list must be used within RecordList.Provider.');

  return context;
};

/** Renders again only when `read` of the selection changes, such as one row's own state. */
export const useSelectionState = <T,>(read: (picked: ReadonlySet<string>) => T) => {
  const { selection } = useRecordListContext();

  return useSyncExternalStore(selection.subscribe, () => read(selection.picked()));
};

/**
 * The selection a record list and its command bar share. Rows that leave the list stay
 * picked until `clear`, so read the selection through the rows the page shows.
 */
export const useRecordListSelection = () => {
  const { selection } = useRecordListContext();
  const picked = useSelectionState((current) => current);

  return {
    ids: [...picked],
    has: (id: string) => picked.has(id),
    toggle: (id: string) => selection.toggle(id),
    toggleAll: selection.toggleAll,
    clear: selection.clear,
  };
};

const SelectionScope = ({ listId, children }: PropsWithChildren<{ listId: string }>) => {
  const [context] = useState<RecordListContextValue>(() => ({
    listId,
    selection: createSelection(),
  }));

  return <RecordListContext.Provider value={context}>{children}</RecordListContext.Provider>;
};

/**
 * `listId` names the list in this browser, where its folded groups are kept. Another
 * `listId` is another list: its selection starts empty.
 */
export const RecordListProvider = ({ listId, children }: PropsWithChildren<{ listId: string }>) => (
  <SelectionScope key={listId} listId={listId}>
    {children}
  </SelectionScope>
);
