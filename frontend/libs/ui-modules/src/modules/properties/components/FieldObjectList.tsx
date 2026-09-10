import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Input, isDeeplyEqual, Textarea } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { SpecificFieldProps } from './Field';

type ObjectListRow = Record<string, string>;

type ObjectListItem = {
  id: string;
  values: ObjectListRow;
};

const isRow = (row: unknown): row is ObjectListRow =>
  typeof row === 'object' && row !== null && !Array.isArray(row);

const parseRows = (value: unknown): ObjectListRow[] =>
  Array.isArray(value) ? value.filter(isRow) : [];

const toItems = (rows: ObjectListRow[]): ObjectListItem[] =>
  rows.map((values) => ({ id: nanoid(), values }));

export const FieldObjectList = (props: SpecificFieldProps) => {
  const { field, value, inCell, handleChange } = props;
  const configs = field.configs?.objectListConfigs ?? [];

  const [items, setItems] = useState<ObjectListItem[]>(() =>
    toItems(parseRows(value)),
  );
  const lastEmitted = useRef<ObjectListRow[]>(parseRows(value));

  useEffect(() => {
    const incoming = parseRows(value);

    if (!isDeeplyEqual(incoming, lastEmitted.current)) {
      setItems(toItems(incoming));
      lastEmitted.current = incoming;
    }
  }, [value]);

  const apply = (next: ObjectListItem[]) => {
    const rows = next.map((item) => item.values);

    setItems(next);
    lastEmitted.current = rows;
    handleChange(rows);
  };

  if (inCell) {
    return items.length === 0 ? (
      <span className="px-2 text-muted-foreground select-none">—</span>
    ) : (
      <span className="px-2 text-muted-foreground text-xs">
        {items.length} {items.length === 1 ? 'entry' : 'entries'}
      </span>
    );
  }

  if (configs.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        No sub-fields configured
      </span>
    );
  }

  const updateRowLocal = (id: string, key: string, rowValue: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, values: { ...item.values, [key]: rowValue } }
          : item,
      ),
    );

  const commitIfChanged = () => {
    const rows = items.map((item) => item.values);

    if (!isDeeplyEqual(rows, lastEmitted.current)) {
      apply(items);
    }
  };

  const removeRow = (id: string) => apply(items.filter((i) => i.id !== id));

  const addRow = () => apply([...items, { id: nanoid(), values: {} }]);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-2 p-2 border rounded-md bg-background"
        >
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label="Remove entry"
              onClick={() => removeRow(item.id)}
            >
              <IconTrash size={14} />
            </Button>
          </div>
          {configs.map((config) => (
            <div key={config.key} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {config.label}
              </span>
              {config.type === 'textarea' ? (
                <Textarea
                  value={item.values[config.key] ?? ''}
                  onChange={(e) =>
                    updateRowLocal(item.id, config.key, e.target.value)
                  }
                  onBlur={commitIfChanged}
                />
              ) : (
                <Input
                  value={item.values[config.key] ?? ''}
                  onChange={(e) =>
                    updateRowLocal(item.id, config.key, e.target.value)
                  }
                  onBlur={commitIfChanged}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addRow}
        className="justify-start w-full font-normal text-muted-foreground"
      >
        <IconPlus size={16} /> Add
      </Button>
    </div>
  );
};
