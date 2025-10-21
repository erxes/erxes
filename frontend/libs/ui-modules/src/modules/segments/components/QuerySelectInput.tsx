import { DocumentNode } from '@apollo/client';
import { Combobox, Command, EnumCursorDirection, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuerySelectInputList } from '../hooks';

type Props = {
  query: DocumentNode;
  queryName: string;
  labelField: string;
  valueField: string;
  focusOnMount: any;
  nullable: boolean;
  onSelect: (optionId: string | string[]) => void;
  initialValue: string;
  multi?: boolean;
};

export const QuerySelectInput = ({
  query,
  queryName,
  labelField,
  valueField,
  focusOnMount,
  nullable,
  onSelect,
  initialValue,
  multi,
}: Props) => {
  const [search, setSearch] = useState('');
  const [value, setValue] = useState<string | string[]>(initialValue || '');
  const [open, setOpen] = useState(false);
  const [debouncedSearch] = useDebounce(search, 500);
  const {
    list = [],
    totalCount = 0,
    handleFetchMore,
  } = useQuerySelectInputList(query, queryName, debouncedSearch);
  const items = list.map((option: any) => ({
    label: option[labelField],
    value: option[valueField],
  }));
  const selectedValue = items?.find(
    (option: any) => option._id === value,
  )?.value;

  const handleSelect = (selectedValue: any) => {
    let updatedValue: string | string[] = '';

    if (multi) {
      const stateArray = Array.isArray(value) ? value : value ? [value] : [];

      const exists = stateArray.find((val) => val === selectedValue);

      updatedValue = exists
        ? stateArray.filter((val) => val !== selectedValue)
        : [...stateArray, selectedValue];
    } else {
      updatedValue = selectedValue === value ? '' : selectedValue;
    }
    setValue(updatedValue);
    onSelect(updatedValue);
    if (!multi) {
      setOpen(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger>
        <Combobox.Value value={selectedValue} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input
            focusOnMount
            placeholder={`Search ${labelField}...`}
            value={search}
            onValueChange={(searchValue) => setSearch(searchValue)}
          />

          <Command.List>
            <Command.Empty>No {labelField}.</Command.Empty>
            {items.map((option: any) => (
              <Command.Item
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
              >
                {option.label}
                <Combobox.Check checked={selectedValue === option.value} />
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
