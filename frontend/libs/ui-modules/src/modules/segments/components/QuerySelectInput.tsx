import { DocumentNode } from '@apollo/client';
import { Combobox, Command, EnumCursorDirection, Popover } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuerySelectInputList } from '../hooks/useQuerySelectInputList';

type TQuerySelectValue = string | string[];

type TQuerySelectOption = {
  label: string;
  value: string;
};

type Props = {
  query: DocumentNode;
  queryName: string;
  labelField: string;
  valueField: string;
  focusOnMount?: boolean;
  nullable: boolean;
  onSelect: (optionId: TQuerySelectValue) => void;
  value?: TQuerySelectValue;
  multi?: boolean;
};

export const QuerySelectInput = ({
  query,
  queryName,
  labelField,
  valueField,
  focusOnMount,
  onSelect,
  value,
  multi,
}: Props) => {
  const [search, setSearch] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, TQuerySelectOption>
  >({});
  const [open, setOpen] = useState(false);
  const [debouncedSearch] = useDebounce(search, 500);
  const {
    list = [],
    totalCount = 0,
    handleFetchMore,
  } = useQuerySelectInputList(query, queryName, debouncedSearch);

  const items = useMemo<TQuerySelectOption[]>(
    () =>
      list.map((option: Record<string, unknown>) => ({
        label: String(option[labelField] || ''),
        value: String(option[valueField] || ''),
      })),
    [labelField, list, valueField],
  );

  useEffect(() => {
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    const matchedOptions = items.filter((option) =>
      selectedValues.includes(option.value),
    );

    if (!matchedOptions.length) {
      return;
    }

    setSelectedOptions((currentOptions) => ({
      ...currentOptions,
      ...Object.fromEntries(
        matchedOptions.map((option) => [option.value, option]),
      ),
    }));
  }, [items, value]);

  const selectedLabel = useMemo(() => {
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

    return selectedValues
      .map(
        (selectedValue) =>
          selectedOptions[selectedValue]?.label ||
          items.find((option) => option.value === selectedValue)?.label,
      )
      .filter(Boolean)
      .join(', ');
  }, [items, selectedOptions, value]);

  const handleSelect = (selectedValue: string) => {
    let updatedValue: TQuerySelectValue = '';
    const selectedOption = items.find(
      (option) => option.value === selectedValue,
    );

    if (multi) {
      const stateArray = Array.isArray(value) ? value : value ? [value] : [];

      const exists = stateArray.find((val) => val === selectedValue);

      updatedValue = exists
        ? stateArray.filter((val) => val !== selectedValue)
        : [...stateArray, selectedValue];
    } else {
      updatedValue = selectedValue === value ? '' : selectedValue;
    }
    if (selectedOption) {
      setSelectedOptions((currentOptions) => ({
        ...currentOptions,
        [selectedOption.value]: selectedOption,
      }));
    }
    onSelect(updatedValue);
    if (!multi) {
      setOpen(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger>
        <Combobox.Value value={selectedLabel} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input
            focusOnMount={focusOnMount}
            placeholder={`Search ${labelField}...`}
            value={search}
            onValueChange={(searchValue) => setSearch(searchValue)}
          />

          <Command.List>
            <Command.Empty>No {labelField}.</Command.Empty>
            {items.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
              >
                {option.label}
                <Combobox.Check
                  checked={
                    Array.isArray(value)
                      ? value.includes(option.value)
                      : value === option.value
                  }
                />
              </Command.Item>
            ))}
            <Combobox.FetchMore
              currentLength={items?.length}
              totalCount={totalCount}
              fetchMore={() =>
                handleFetchMore({ direction: EnumCursorDirection.FORWARD })
              }
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
