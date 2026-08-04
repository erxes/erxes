import { useMemo } from 'react';

interface UseMultiSelectComputationProps {
  isMultiSelect: boolean;
  added?: unknown[];
  removed?: unknown[];
  previousValue?: unknown;
  currentValue?: unknown;
}

/**
 * Check if a field type is multiselect or checkbox
 */
export const isMultiSelectOrCheckboxField = (fieldType?: string): boolean => {
  return ['multiselect', 'checkbox'].includes(fieldType?.toLowerCase() || '');
};

/**
 * Compute added/removed items from prev/current values if not already provided
 */
export const useMultiSelectComputation = ({
  isMultiSelect,
  added,
  removed,
  previousValue,
  currentValue,
}: UseMultiSelectComputationProps) => {
  return useMemo(() => {
    let finalAdded = added;
    let finalRemoved = removed;

    // Compute added/removed from prev/current if not already provided for multiselect/checkbox
    if (
      isMultiSelect &&
      (!finalAdded || !finalRemoved) &&
      Array.isArray(previousValue) &&
      Array.isArray(currentValue)
    ) {
      const prevSet = new Set(previousValue);
      const currentSet = new Set(currentValue);

      finalAdded = Array.from(currentSet).filter((item) => !prevSet.has(item));
      finalRemoved = Array.from(prevSet).filter(
        (item) => !currentSet.has(item),
      );
    }

    return { finalAdded, finalRemoved };
  }, [isMultiSelect, added, removed, previousValue, currentValue]);
};
