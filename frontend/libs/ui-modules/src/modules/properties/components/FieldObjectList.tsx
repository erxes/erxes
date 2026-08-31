import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Input, Textarea } from 'erxes-ui';
import { SpecificFieldProps } from './Field';

type ObjectListRow = Record<string, string>;

const parseRows = (value: unknown): ObjectListRow[] =>
  Array.isArray(value) ? value : [];

const rowsEqual = (a: ObjectListRow[], b: ObjectListRow[]) =>
  a.length === b.length &&
  a.every((row, index) => {
    const other = b[index] || {};
    const keys = new Set([...Object.keys(row), ...Object.keys(other)]);

    return [...keys].every((key) => row[key] === other[key]);
  });

export const FieldObjectList = (props: SpecificFieldProps) => {
  const { field, value, inCell, handleChange } = props;
  const configs = field.configs?.objectListConfigs ?? [];

  const [rows, setRows] = useState<ObjectListRow[]>(() => parseRows(value));
  const lastEmitted = useRef<ObjectListRow[]>(rows);

  useEffect(() => {
    const incoming = parseRows(value);

    if (!rowsEqual(incoming, lastEmitted.current)) {
      setRows(incoming);
      lastEmitted.current = incoming;
    }
  }, [value]);

  const apply = (next: ObjectListRow[]) => {
    setRows(next);
    lastEmitted.current = next;
    handleChange(next);
  };

  if (inCell) {
    return rows.length === 0 ? (
      <span className="px-2 text-muted-foreground select-none">—</span>
    ) : (
      <span className="px-2 text-muted-foreground text-xs">
        {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
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

  const updateRowLocal = (index: number, key: string, rowValue: string) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: rowValue } : row)),
    );

  const commitIfChanged = () => {
    if (!rowsEqual(rows, lastEmitted.current)) {
      apply(rows);
    }
  };

  const removeRow = (index: number) =>
    apply(rows.filter((_, i) => i !== index));

  const addRow = () => apply([...rows, {}]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 p-2 border rounded-md bg-background"
        >
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => removeRow(index)}
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
                  value={row[config.key] ?? ''}
                  onChange={(e) =>
                    updateRowLocal(index, config.key, e.target.value)
                  }
                  onBlur={commitIfChanged}
                />
              ) : (
                <Input
                  value={row[config.key] ?? ''}
                  onChange={(e) =>
                    updateRowLocal(index, config.key, e.target.value)
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
