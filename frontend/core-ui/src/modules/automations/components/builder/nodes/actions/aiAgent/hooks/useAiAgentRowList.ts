import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldPath, get, useFormContext, useFormState } from 'react-hook-form';

export type TAiAgentRowListName =
  | 'captureFields'
  | 'objectFields'
  | 'topics'
  | 'tools';

// Past this many rows a search box beats scrolling.
const SEARCH_THRESHOLD = 8;

/**
 * Open row, search and error state of a collapsed row list. Rows stay closed
 * by default, so a failed submit opens the first row with an error; otherwise
 * its message would sit inside a closed row.
 */
export const useAiAgentRowList = <T extends { id?: string }>({
  name,
  fields,
  values,
  getLabel,
}: {
  name: TAiAgentRowListName;
  fields: { id: string }[];
  values: T[];
  getLabel: (value?: T) => string;
}) => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  // Rows are keyed by the item's own id, which is known before the append
  // re-renders, so a new row can open at once.
  const items = useMemo(
    () =>
      fields.map((field, index) => ({
        id: values[index]?.id || field.id,
        label: getLabel(values[index]),
      })),
    [fields, values, getLabel],
  );
  const { errors, submitCount } = useFormState({
    control,
    name: name as FieldPath<TAiAgentConfigForm>,
  });
  const listErrors = get(errors, name);
  // A list mounted by a jump to its tab after a failed submit opens on the
  // first error right away.
  const [openId, setOpenId] = useState(
    () => items.find((_, index) => !!listErrors?.[index])?.id || '',
  );
  const [search, setSearch] = useState('');

  const errorIds = useMemo(
    () =>
      new Set(
        items.filter((_, index) => !!listErrors?.[index]).map(({ id }) => id),
      ),
    [items, listErrors],
  );
  const listErrorMessage: string | undefined =
    listErrors?.root?.message || listErrors?.message;

  // Only a new submit attempt moves the open row, not every edit after it.
  const handledSubmitRef = useRef(submitCount);
  useEffect(() => {
    if (handledSubmitRef.current === submitCount) {
      return;
    }
    handledSubmitRef.current = submitCount;

    const firstErrorId = items.find(({ id }) => errorIds.has(id))?.id;

    if (firstErrorId) {
      setSearch('');
      setOpenId(firstErrorId);
    }
  }, [submitCount, items, errorIds]);

  const query = search.trim().toLowerCase();
  const visibleIds = useMemo(
    () =>
      new Set(
        items
          .filter(({ label }) => !query || label.toLowerCase().includes(query))
          .map(({ id }) => id),
      ),
    [items, query],
  );

  const openRow = (id: string) => {
    setSearch('');
    setOpenId(id);
  };

  return {
    items,
    openRow,
    openId,
    setOpenId,
    search,
    setSearch,
    showSearch: items.length > SEARCH_THRESHOLD,
    isVisible: (id: string) => visibleIds.has(id),
    hasNoMatch: !!query && !visibleIds.size,
    hasError: (id: string) => errorIds.has(id),
    listErrorMessage,
  };
};
