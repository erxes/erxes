import { useQuery } from '@tanstack/react-query';
import { DatePicker, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { api } from '~/lib/api';

/** `YYYY-MM-DD` of a local date. */
export const toYmd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatYmd = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** A date (`YYYY-MM-DD`) edited in place with a calendar. */
export const DateInlineCell = ({
  value,
  scope,
  onSave,
}: {
  value: string | null;
  scope: string;
  onSave: (value: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {value ? formatYmd(value) : <span className="text-muted-foreground" />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto p-0">
        <DatePicker
          inline
          value={value}
          defaultMonth={value ? new Date(value) : undefined}
          onChange={(date) => {
            const next = date instanceof Date ? toYmd(date) : null;

            if (next !== value) onSave(next);
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** Active team members, for owner pickers. */
export const useMembers = () => {
  const query = useQuery({
    queryKey: ['users', 'options'],
    queryFn: () => api.users.list({ limit: 100, status: 'active' }),
    staleTime: 60_000,
  });

  return query.data?.data ?? [];
};
