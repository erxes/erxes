import { IconCircleFilled } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';

const getFieldConfig = (field: string, index: number) => {
  const colors = [
    'text-blue-600',
    'text-green-500',
    'text-purple-500',
    'text-red-500',
    'text-yellow-500',
    'text-orange-500',
    'text-emerald-500',
    'text-pink-500',
    'text-indigo-500',
    'text-teal-500',
  ];

  return {
    label: field.replace(/([A-Z])/g, ' $1').trim(),
    color: colors[index % colors.length],
  };
};

export const ProgressDot = ({
  status,
  index,
}: {
  status: string;
  index: number;
}) => {
  const config = getFieldConfig(status, index);

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger>
          <IconCircleFilled
            className={cn('size-2', config?.color || 'text-gray-400')}
          />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="capitalize">{status}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

interface PosOrderSummaryProps {
  summary: Record<string, number>;
}

export const PosOrderSummary = ({ summary }: PosOrderSummaryProps) => {
  const summaryEntries = Object.entries(summary).filter(
    ([_, value]) => value > 0,
  );

  return (
    <div className="flex flex-col gap-4 items-start w-full my-4">
      {summaryEntries.map(([field, value], index) => {
        const config = getFieldConfig(field, index);
        const label = config?.label || field.replace(/([A-Z])/g, ' $1').trim();

        return (
          <div key={field} className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <ProgressDot status={field} index={index} />
              <p className="text-xs font-medium text-muted-foreground">
                {label}:
              </p>
            </div>
            <p className="text-xs font-medium">{value.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
};
