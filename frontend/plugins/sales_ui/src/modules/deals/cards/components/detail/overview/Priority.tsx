import { Select, Spinner, cn } from 'erxes-ui';

import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500',
};

const Priority = ({
  priority,
  dealId,
}: {
  priority: string;
  dealId: string;
}) => {
  const { editDeals, loading } = useDealsEdit();

  const onChangePriority = (value: string) => {
    editDeals({
      variables: {
        _id: dealId,
        priority: value,
      },
    });
  };

  return (
    <Select
      value={priority}
      onValueChange={onChangePriority}
      disabled={loading}
    >
      <Select.Trigger id="time-unit" className="mt-1">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Saving...
          </div>
        ) : (
          <Select.Value placeholder="Select priority" />
        )}
      </Select.Trigger>
      <Select.Content>
        {['critical', 'high', 'medium', 'low'].map((value) => (
          <Select.Item key={value} value={value}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-block w-2 h-2 rounded-full',
                  PRIORITY_COLORS[value],
                )}
              />
              <span className="capitalize">{value}</span>
            </div>
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

export default Priority;
