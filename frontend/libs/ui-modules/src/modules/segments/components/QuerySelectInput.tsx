import { DocumentNode } from '@apollo/client';
import { Combobox, Command, Popover } from 'erxes-ui';
import {
  TQuerySelectValue,
  useQuerySelectInput,
} from '../hooks/useQuerySelectInput';

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
  variables?: Record<string, string | boolean>;
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
  variables,
}: Props) => {
  const {
    open,
    setOpen,
    search,
    setSearch,
    selectedLabel,
    options,
    totalCount,
    handleSelect,
    fetchMore,
  } = useQuerySelectInput({
    query,
    queryName,
    labelField,
    valueField,
    value,
    multi,
    variables,
    onSelect,
  });

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
            onValueChange={setSearch}
          />

          <Command.List>
            <Command.Empty>No {labelField}.</Command.Empty>
            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
              >
                {option.label}
                <Combobox.Check checked={option.checked} />
              </Command.Item>
            ))}
            <Combobox.FetchMore
              currentLength={options.length}
              totalCount={totalCount}
              fetchMore={fetchMore}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
