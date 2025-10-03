import { QueryState, useQueryState } from 'erxes-ui/hooks/use-query-state';
import { recordTableCursorAtomFamily } from 'erxes-ui/modules/record-table/states/RecordTableCursorState';
import { useSetAtom } from 'jotai';

export function useFilterQueryState<T>(
  queryKey: string,
  cursorKey?: string,
  options?: {
    defaultValue?: T;
  },
): QueryState<T> {
  const [query, setQuery] = useQueryState<T>(queryKey, options);
  const setCursor = useSetAtom(recordTableCursorAtomFamily(cursorKey ?? ''));

  return [
    query,
    (value: T | null) => {
      setQuery(value);
      if (cursorKey) {
        setCursor('');
      }
    },
  ];
}
