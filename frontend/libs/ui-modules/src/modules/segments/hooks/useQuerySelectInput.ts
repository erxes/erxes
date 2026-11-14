import { DocumentNode } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuerySelectInputList } from './useQuerySelectInputList';

export type TQuerySelectValue = string | string[];

type TQuerySelectOption = {
  label: string;
  value: string;
};

const SEARCH_DEBOUNCE_MS = 500;

const valuesOf = (value?: TQuerySelectValue) =>
  Array.isArray(value) ? value : value ? [value] : [];

const isSelected = (value: TQuerySelectValue | undefined, option: string) =>
  valuesOf(value).includes(option);

// Multi toggles the option in the list; single picks it or clears it
const toggledValue = (
  value: TQuerySelectValue | undefined,
  selected: string,
  multi?: boolean,
): TQuerySelectValue => {
  if (!multi) {
    return selected === value ? '' : selected;
  }

  const values = valuesOf(value);

  return values.includes(selected)
    ? values.filter((current) => current !== selected)
    : [...values, selected];
};

const byValue = (options: TQuerySelectOption[]) =>
  Object.fromEntries(options.map((option) => [option.value, option]));

/**
 * A searchable select over any list query. Chosen options are remembered so
 * their labels still show after the search moves on to other results.
 */
export const useQuerySelectInput = ({
  query,
  queryName,
  labelField,
  valueField,
  value,
  multi,
  variables,
  onSelect,
}: {
  query: DocumentNode;
  queryName: string;
  labelField: string;
  valueField: string;
  value?: TQuerySelectValue;
  multi?: boolean;
  variables?: Record<string, string | boolean>;
  onSelect: (value: TQuerySelectValue) => void;
}) => {
  const [search, setSearch] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, TQuerySelectOption>
  >({});
  const [open, setOpen] = useState(false);
  const [debouncedSearch] = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const {
    list = [],
    totalCount = 0,
    handleFetchMore,
  } = useQuerySelectInputList(
    query,
    queryName,
    debouncedSearch,
    false,
    variables,
  );

  const items = useMemo<TQuerySelectOption[]>(
    () =>
      list.map((option: Record<string, unknown>) => ({
        label: String(option[labelField] || ''),
        value: String(option[valueField] || ''),
      })),
    [labelField, list, valueField],
  );

  useEffect(() => {
    const matched = items.filter((option) => isSelected(value, option.value));

    if (matched.length) {
      setSelectedOptions((current) => ({ ...current, ...byValue(matched) }));
    }
  }, [items, value]);

  const selectedLabel = useMemo(
    () =>
      valuesOf(value)
        .map(
          (selected) =>
            selectedOptions[selected]?.label ||
            items.find((option) => option.value === selected)?.label,
        )
        .filter(Boolean)
        .join(', '),
    [items, selectedOptions, value],
  );

  const options = useMemo(
    () =>
      items.map((option) => ({
        ...option,
        checked: isSelected(value, option.value),
      })),
    [items, value],
  );

  const handleSelect = useCallback(
    (selected: string) => {
      const option = items.find((item) => item.value === selected);

      if (option) {
        setSelectedOptions((current) => ({
          ...current,
          [option.value]: option,
        }));
      }

      onSelect(toggledValue(value, selected, multi));

      if (!multi) {
        setOpen(false);
      }
    },
    [items, value, multi, onSelect],
  );

  const fetchMore = useCallback(
    () => handleFetchMore({ direction: EnumCursorDirection.FORWARD }),
    [handleFetchMore],
  );

  return {
    open,
    setOpen,
    search,
    setSearch,
    selectedLabel,
    options,
    totalCount,
    handleSelect,
    fetchMore,
  };
};
