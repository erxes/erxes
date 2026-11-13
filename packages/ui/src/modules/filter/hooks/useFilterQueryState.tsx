import type { QueryState } from 'erxes-ui/hooks/use-query-state';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';
import { recordTableCursorAtomFamily } from 'erxes-ui/modules/record-table/states/RecordTableCursorState';
import { useSetAtom } from 'jotai';
import type { z } from 'zod';

/** A filter's query value; changing it sends the table back to its first page. */
export function useFilterQueryState<S extends z.ZodType>(
  queryKey: string,
  schema: S,
  cursorKey?: string,
): QueryState<z.output<S>> {
  const [query, setQuery] = useQueryState(queryKey, schema);
  const setCursor = useSetAtom(recordTableCursorAtomFamily(cursorKey ?? ''));

  return [
    query,
    (value) => {
      setQuery(value);

      if (cursorKey) {
        setCursor('');
      }
    },
  ];
}
