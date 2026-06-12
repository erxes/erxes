import { useQuery } from '@apollo/client';
import { Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { FIELDS_COMBINED_BY_CONTENT_TYPE } from '@/products/settings/graphql/queries/getFieldsCombined';

type CombinedField = { name: string; label?: string };

interface FilterFieldSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const FilterFieldSelect = ({
  value,
  onValueChange,
}: FilterFieldSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data } = useQuery(FIELDS_COMBINED_BY_CONTENT_TYPE, {
    variables: { contentType: 'core:product' },
  });

  // Dedupe by `name` — the backend may return the same field twice (e.g.
  // `categoryId` as both "Categories" and "Category"), which also makes the
  // command list highlight two rows at once since they share the same value.
  const seen = new Set<string>();
  const fields: CombinedField[] = (
    data?.fieldsCombinedByContentType || []
  ).filter((field: CombinedField) => {
    if (!field?.name || seen.has(field.name)) return false;
    seen.add(field.name);
    return true;
  });

  const selectedField = fields.find((field) => field.name === value);

  const filteredFields = fields.filter((field) =>
    (field.label || field.name)
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch('');
      }}
    >
      <Combobox.Trigger className="w-full">
        <Combobox.Value
          value={selectedField?.label || selectedField?.name}
          placeholder="Select field"
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            placeholder="Search field"
            value={search}
            onValueChange={setSearch}
          />
          <Command.Separator />
          <Command.List>
            <Combobox.Empty />
            {filteredFields.map((field) => (
              <Command.Item
                key={field.name}
                value={field.name}
                onSelect={() => {
                  onValueChange(field.name);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {field.label || field.name}
                {value === field.name && (
                  <Combobox.Check checked className="ml-auto" />
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
