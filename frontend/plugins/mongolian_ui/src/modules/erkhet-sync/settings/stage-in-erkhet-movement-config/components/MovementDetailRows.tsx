import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { IMovementDetail } from '../types';

interface Props {
  details: IMovementDetail[];
  onChange: (details: IMovementDetail[]) => void;
}

type ColumnDef = {
  key: keyof Omit<IMovementDetail, '_id'>;
  label: string;
  fullWidth?: boolean;
};

type RowGroup = {
  id: string;
  cols: ColumnDef[];
};

const ROWS: RowGroup[] = [
  {
    id: 'row-category-branch',
    cols: [
      { key: 'productCategory', label: 'Product Category' },
      { key: 'branch', label: 'Branch' },
    ],
  },
  {
    id: 'row-department-account',
    cols: [
      { key: 'department', label: 'Department' },
      { key: 'mainAccount', label: 'Main Account' },
    ],
  },
  {
    id: 'row-location-move',
    cols: [
      { key: 'mainLocation', label: 'Main Location' },
      { key: 'moveAccount', label: 'Move Account' },
    ],
  },
  {
    id: 'row-move-location',
    cols: [{ key: 'moveLocation', label: 'Move Location', fullWidth: true }],
  },
];

interface RowProps {
  row: IMovementDetail;
  onUpdate: (id: string, key: keyof Omit<IMovementDetail, '_id'>, value: string) => void;
  onRemove: (id: string) => void;
}

const MovementDetailRow = ({ row, onUpdate, onRemove }: RowProps) => (
  <div className="overflow-hidden">
    <div className="p-3 flex flex-col gap-2">
      {ROWS.map(({ id, cols }) => (
        <div key={id} className="grid grid-cols-2 gap-4">
          {cols.map(({ key, label, fullWidth }) => (
            <div
              key={key}
              className={`flex flex-col gap-2 ${fullWidth ? 'col-span-2' : ''}`}
            >
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </label>
              <Input
                placeholder={label}
                value={row[key] ?? ''}
                onChange={(e) => onUpdate(row._id, key, e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="flex items-center justify-end px-3 py-2">
      <button
        type="button"
        onClick={() => onRemove(row._id)}
        className="flex items-center gap-1 text-xs text-destructive"
      >
        <IconTrash size={13} />
        Remove
      </button>
    </div>
  </div>
);

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Details
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="h-7 text-xs gap-1"
        >
          <IconPlus size={12} />
          Add
        </Button>
      </div>

      {details.length > 0 && (
        <div className="flex flex-col gap-3">
          {details.map((row) => (
            <MovementDetailRow
              key={row._id}
              row={row}
              onUpdate={updateField}
              onRemove={removeRow}
            />
          ))}
        </div>
      )}

      {details.length === 0 && (
        <div className="border border-dashed rounded-lg py-6 flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs">No details added yet</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="h-7 text-xs gap-1"
          >
            <IconPlus size={12} />
            Add first detail
          </Button>
        </div>
      )}
    </div>
  );
};
