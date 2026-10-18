import { useMultiQueryState } from 'erxes-ui';
import { useEffect, useRef } from 'react';

const LIST_FILTERS_KEY = 'automations:listFilters';

type TAutomationsListFilters = {
  searchValue?: string;
  status?: string;
  createdAt?: string;
  createdByIds?: string;
  updatedAt?: string;
  updatedByIds?: string;
  tagIds?: string[];
  actionTypes?: string[];
  triggerTypes?: string[];
};

// Links to /automations drop the query, so restore the last filters for the session; a URL query wins.
export const useAutomationsListFilterMemory = () => {
  const [queries, setQueries] = useMultiQueryState<TAutomationsListFilters>([
    'searchValue',
    'status',
    'createdAt',
    'createdByIds',
    'updatedAt',
    'updatedByIds',
    'tagIds',
    'actionTypes',
    'triggerTypes',
  ]);
  const restoredRef = useRef(false);

  const activeFilters = Object.fromEntries(
    Object.entries(queries).filter(([, value]) => value !== null),
  );
  const serializedFilters = Object.keys(activeFilters).length
    ? JSON.stringify(activeFilters)
    : '';

  useEffect(() => {
    if (!restoredRef.current) {
      restoredRef.current = true;
      const saved = sessionStorage.getItem(LIST_FILTERS_KEY);

      if (!serializedFilters && saved) {
        setQueries(JSON.parse(saved));
        return;
      }
    }

    if (serializedFilters) {
      sessionStorage.setItem(LIST_FILTERS_KEY, serializedFilters);
    } else {
      sessionStorage.removeItem(LIST_FILTERS_KEY);
    }
  }, [serializedFilters]);
};
