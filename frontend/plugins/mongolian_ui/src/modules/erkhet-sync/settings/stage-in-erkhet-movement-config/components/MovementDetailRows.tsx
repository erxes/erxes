import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { IMovementDetail } from '../types';

interface Props {
  details: IMovementDetail[];
  onChange: (details: IMovementDetail[]) => void;
}

const COLUMNS: { key: keyof Omit<IMovementDetail, '_id'>; label: string }[] = [
  { key: 'productCategory', label: 'Product Category' },
  { key: 'branch', label: 'Branch' },
  { key: 'department', label: 'Department' },
  { key: 'mainAccount', label: 'Main Account' },
  { key: 'mainLocation', label: 'Main Location' },
  { key: 'moveAccount', label: 'Move Account' },
  { key: 'moveLocation', label: 'Move Location' },
];

export const MovementDetailRows = ({ details, onChange }: Props) => {
  const addRow = () => {
    onChange([
      ...details,
      {
        _id: nanoid(),
        productCategory: '',
        branch: '',
        department: '',
        mainAccount: '',
        mainLocation: '',
        moveAccount: '',
        moveLocation: '',
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(details.filter((d) => d._id !== id));
  };

  const updateField = (
    id: string,
    key: keyof Omit<IMovementDetail, '_id'>,
    value: string,
  ) => {
    onChange(details.map((d) => (d._id === id ? { ...d, [key]: value } : d)));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          Details
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="text-xs"
        >
          <IconPlus size={14} />
          Add
        </Button>
      </div>

      {details.length > 0 && (
        <div className="flex flex-col gap-2">
          {details.map((row) => (
            <div
              key={row._id}
              className="border rounded-md p-3 flex flex-col gap-2 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-destructive hover:text-destructive p-1 h-auto"
                onClick={() => removeRow(row._id)}
              >
                <IconTrash size={14} />
              </Button>

              <div className="grid grid-cols-2 gap-2 pr-6">
                {COLUMNS.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      {label}
                    </label>
                    <Input
                      placeholder={label}
                      value={row[key] ?? ''}
                      onChange={(e) => updateField(row._id, key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
