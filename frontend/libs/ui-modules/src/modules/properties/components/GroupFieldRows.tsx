import { cn } from 'erxes-ui';
import { ReactNode, useMemo } from 'react';
import { IField, IFieldGroup } from '../types/fieldsTypes';
import { buildGroupRows } from '../utils/groupLayout';

// Spelled out so Tailwind keeps the classes.
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export const GroupFieldRows = ({
  group,
  fields,
  renderField,
}: {
  group: IFieldGroup;
  fields: IField[];
  renderField: (field: IField) => ReactNode;
}) => {
  const rows = useMemo(() => buildGroupRows(group, fields), [group, fields]);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div
          key={row.fields[0]._id}
          className={cn('grid gap-4', GRID_COLS[row.columns])}
        >
          {row.fields.map(renderField)}
        </div>
      ))}
    </div>
  );
};
