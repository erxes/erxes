import { useMultiQueryState } from 'erxes-ui';

// What the filter bar can actually set, so "filtered" is only ever said about
// a filter someone can see and loosen.
const BROADCAST_FILTER_KEYS = [
  'searchValue',
  'status',
  'trigger',
  'methods',
  'brand',
  'fromUser',
];

export const useBroadcastIsFiltered = () => {
  const [queries] = useMultiQueryState<Record<string, string>>(
    BROADCAST_FILTER_KEYS,
  );

  return Object.values(queries || {}).some(
    (value) => value !== null && value !== undefined,
  );
};
