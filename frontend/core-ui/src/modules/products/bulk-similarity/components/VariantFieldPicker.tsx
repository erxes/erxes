import { Badge, Button, Input, Popover, Tooltip } from 'erxes-ui';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useFields } from 'ui-modules';
import { useVariantFields } from '../hooks/useVariantFields';

export const VariantFieldAddButton = () => {
  const { fieldIds, handleToggleFieldValue } = useVariantFields();
  const { fields, loading } = useFields({ contentType: 'core:product' });
  const optionFields = fields.filter((f) => (f.options || []).length > 0);

  return (
    <AddFieldPopover
      fields={optionFields}
      activeFieldIds={fieldIds}
      loading={loading}
      onPick={(fieldId, value) => handleToggleFieldValue(fieldId, value)}
    />
  );
};

export const VariantFieldPicker = () => {
  const { properties, fieldIds, handleToggleFieldValue, handleRemoveField } =
    useVariantFields();
  const { fields } = useFields({ contentType: 'core:product' });

  const optionFields = fields.filter((f) => (f.options || []).length > 0);

  return (
    <div className="flex flex-col gap-3">
      {fieldIds.length === 0 && (
        <div className="flex justify-center items-center px-4 py-6 text-sm rounded-lg border border-dashed text-muted-foreground">
          No fields added yet.
        </div>
      )}

      {properties.map((property) => {
        const fieldId = property.fieldId;
        const field = optionFields.find((f) => f._id === fieldId);
        if (!field) return null;
        const options = field.options || [];
        const selected = property.values || [];

        return (
          <div
            key={fieldId}
            className="flex gap-3 items-center p-2 rounded-lg bg-foreground/5"
          >
            <div className="w-32 shrink-0">
              <div className="text-sm font-medium truncate" title={field.name}>
                {field.name}
              </div>
            </div>
            <div className="flex flex-wrap flex-auto gap-1">
              {options.map((option) => {
                const isOn = selected.includes(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant={isOn ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() =>
                      handleToggleFieldValue(fieldId, option.value)
                    }
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
            <Tooltip.Provider>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7"
                    onClick={() => handleRemoveField(fieldId)}
                  >
                    <IconX size={14} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Remove field</Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </div>
        );
      })}
    </div>
  );
};

const AddFieldPopover = ({
  fields,
  activeFieldIds,
  loading,
  onPick,
}: {
  fields: ReturnType<typeof useFields>['fields'];
  activeFieldIds: string[];
  loading: boolean;
  onPick: (fieldId: string, value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const available = useMemo(
    () => fields.filter((f) => !activeFieldIds.includes(f._id)),
    [fields, activeFieldIds],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return available;
    return available.filter((f) => f.name?.toLowerCase().includes(q));
  }, [available, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-accent-foreground"
          disabled={!loading && !available.length}
        >
          <IconPlus className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-2 w-56" align="end">
        {available.length > 5 && (
          <Input
            autoFocus
            placeholder="Search fields…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
        )}
        {loading && <div className="text-sm">Loading…</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {available.length ? 'No matches' : 'No more fields'}
          </div>
        )}
        <div className="flex flex-col">
          {filtered.map((field) => (
            <button
              type="button"
              key={field._id}
              className="px-2 py-1.5 text-sm text-left rounded hover:bg-accent"
              onClick={() => {
                // adding the first option starts the axis; user picks the rest
                const first = field.options?.[0];
                if (first) {
                  onPick(field._id, first.value);
                  setOpen(false);
                  setSearch('');
                }
              }}
            >
              {field.name}
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
