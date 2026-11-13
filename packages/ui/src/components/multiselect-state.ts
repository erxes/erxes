import type { Command } from 'erxes-ui/components/command';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { groupOptions, hasOptionValue, type MultiSelectOption } from './multiselect-options';

export interface MultipleSelectorProps {
  value?: MultiSelectOption[];
  defaultOptions?: MultiSelectOption[];
  /** manually controlled options */
  options?: MultiSelectOption[];
  placeholder?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  /** Debounce time for search, in ms. */
  delay?: number;
  /** Search as soon as the input gets focus, before anything is typed. */
  triggerSearchOnFocus?: boolean;
  /** async search; options come from it while it is set. */
  onSearch?: (value: string) => Promise<MultiSelectOption[]>;
  /** sync search, without the loading indicator. */
  onSearchSync?: (value: string) => MultiSelectOption[];
  onChange?: (options: MultiSelectOption[]) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** Called instead of selecting when the limit is reached. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Group the options by this option key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  /**
   * cmdk highlights the first item; false adds a hidden dummy item instead.
   * @see https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow creating an option when none matches. */
  creatable?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Command.Input>,
    'value' | 'placeholder' | 'disabled'
  >;
  hideClearAllButton?: boolean;
}

export interface MultipleSelectorRef {
  selectedValue: MultiSelectOption[];
  input: HTMLInputElement | null;
  focus: () => void;
  reset: () => void;
}

/** The selection: follows `value` whenever the parent passes a new one, otherwise local. */
const useSelection = (value: MultiSelectOption[] | undefined) => {
  const [selected, setSelected] = useState(value ?? []);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);

    if (value) setSelected(value);
  }

  return [selected, setSelected] as const;
};

/** The latest `onSearch`, so a parent's inline function does not restart the search. */
const useLatest = <Value>(value: Value) => {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
};

/** The options to offer: the given ones, or the latest search results for the typed term. */
const useOptions = (props: MultipleSelectorProps, open: boolean, term: string) => {
  const { options, onSearch, onSearchSync, triggerSearchOnFocus } = props;
  const searching = open && (triggerSearchOnFocus === true || term !== '');
  const [found, setFound] = useState<{ term: string; options: MultiSelectOption[] } | null>(null);
  const onSearchRef = useLatest(onSearch);
  const hasAsyncSearch = onSearch !== undefined;

  useEffect(() => {
    const search = onSearchRef.current;

    if (!search || !searching) return;

    let stale = false;

    const load = async () => {
      const results = await search(term);

      if (!stale) setFound({ term, options: results });
    };

    void load();

    return () => {
      stale = true;
    };
  }, [onSearchRef, searching, term]);

  const syncResults = onSearchSync && searching ? onSearchSync(term) : undefined;

  const list =
    !onSearch && options ? options : (syncResults ?? found?.options ?? props.defaultOptions ?? []);

  return {
    groups: groupOptions(list, props.groupBy),
    isLoading: hasAsyncSearch && searching && found?.term !== term,
  };
};

/** Closes the dropdown on a press outside it and the input. */
const useCloseOnOutsidePress = (
  open: boolean,
  dropdownRef: React.RefObject<HTMLElement | null>,
  inputRef: React.RefObject<HTMLElement | null>,
  close: () => void,
) => {
  const closeRef = useLatest(close);

  useEffect(() => {
    if (!open) return;

    const onPress = (event: MouseEvent | TouchEvent) => {
      const { target } = event;

      const inside =
        target instanceof Node &&
        [dropdownRef, inputRef].some((element) => element.current?.contains(target) === true);

      if (!inside) closeRef.current();
    };

    document.addEventListener('mousedown', onPress);
    document.addEventListener('touchend', onPress);

    return () => {
      document.removeEventListener('mousedown', onPress);
      document.removeEventListener('touchend', onPress);
    };
  }, [open, dropdownRef, inputRef, closeRef]);
};

/** Selection, options, open state and the actions MultipleSelector's parts use. */
export const useMultipleSelector = (
  props: MultipleSelectorProps,
  ref: React.Ref<MultipleSelectorRef> | undefined,
) => {
  const { maxSelected = Number.MAX_SAFE_INTEGER, creatable = false, onSearch } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [onScrollbar, setOnScrollbar] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [term] = useDebounce(inputValue, props.delay ?? 500);
  const [selected, setSelected] = useSelection(props.value);
  const { groups, isLoading } = useOptions(props, open, term);

  useCloseOnOutsidePress(open, dropdownRef, inputRef, () => {
    setOpen(false);
    inputRef.current?.blur();
  });

  useImperativeHandle(
    ref,
    () => ({
      selectedValue: [...selected],
      input: inputRef.current,
      focus: () => inputRef.current?.focus(),
      reset: () => setSelected([]),
    }),
    [selected, setSelected],
  );

  const change = (next: MultiSelectOption[]) => {
    setSelected(next);
    props.onChange?.(next);
  };

  const select = (option: MultiSelectOption) => {
    if (selected.length >= maxSelected) {
      props.onMaxSelected?.(selected.length);

      return;
    }

    setInputValue('');
    change([...selected, option]);
  };

  const remove = (option: MultiSelectOption) =>
    change(selected.filter((item) => item.value !== option.value));

  const canCreate =
    creatable &&
    !hasOptionValue(groups, inputValue) &&
    !selected.some((item) => item.value === inputValue) &&
    (onSearch ? term.length > 0 && !isLoading : inputValue.length > 0);

  return {
    inputRef,
    dropdownRef,
    open,
    setOpen,
    onScrollbar,
    setOnScrollbar,
    inputValue,
    setInputValue,
    selected,
    groups,
    isLoading,
    canCreate,
    change,
    select,
    remove,
  };
};

export type MultipleSelectorState = ReturnType<typeof useMultipleSelector>;
