import { useEffect, useRef } from 'react';

/**
 * Picks for the person what there is no choosing about: the only option
 * when nothing is chosen yet, and one that appears after the list first
 * loaded, which is the one they just made.
 */
export const useTemplateRequirementOptions = ({
  ids,
  value,
  loading,
  onSelect,
}: {
  ids: string[];
  value?: string;
  loading?: boolean;
  onSelect: (value: string) => void;
}) => {
  const known = useRef<Set<string> | null>(null);
  const idsKey = ids.join(',');

  useEffect(() => {
    if (loading) {
      return;
    }

    const current = idsKey ? idsKey.split(',') : [];
    const added = known.current
      ? current.filter((id) => !known.current?.has(id))
      : [];

    known.current = new Set(current);

    if (added.length === 1) {
      onSelect(added[0]);
    } else if (!value && current.length === 1) {
      onSelect(current[0]);
    }
  }, [idsKey, value, loading, onSelect]);
};
