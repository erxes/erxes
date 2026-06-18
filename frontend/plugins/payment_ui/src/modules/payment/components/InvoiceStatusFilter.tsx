import { IconCheck, IconChevronLeft } from '@tabler/icons-react';
import { Command, useFilterContext, useMultiQueryState } from 'erxes-ui';

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

export const InvoiceStatusFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{ status?: string }>([
    'status',
  ]);
  const { status } = queries;
  const { setView } = useFilterContext();

  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item
          value="back"
          className="cursor-pointer text-sm text-muted-foreground"
          onSelect={() => setView('root')}
        >
          <IconChevronLeft className="w-3 h-3" />
          Back
        </Command.Item>
        <Command.Separator />
        {STATUS_OPTIONS.map((opt) => (
          <Command.Item
            key={opt.value}
            value={opt.value}
            className="cursor-pointer text-sm"
            onSelect={() => setQueries({ status: opt.value })}
          >
            {opt.label}
            {status === opt.value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
