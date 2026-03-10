import { IconCircleFilled } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';

// Configuration for field display
const FIELD_CONFIG = {
  count: { label: 'Count', color: 'text-primary' },
  totalAmount: { label: 'Total amount', color: 'text-blue-500' },
  cashAmount: { label: 'Cash amount', color: 'text-green-500' },
  mobileAmount: { label: 'Mobile amount', color: 'text-purple-500' },
  khaanAmount: { label: 'Khaan', color: 'text-orange-500' },
  golomtCardAmount: { label: 'Golomt card', color: 'text-pink-500' },
  Invoice: { label: 'Invoice', color: 'text-indigo-500' },
  undefinedAmount: { label: 'Undefined', color: 'text-gray-500' },
  barterAmount: { label: 'Barter', color: 'text-yellow-500' },
  skipEbarimtAmount: { label: 'Skip Ebarimt', color: 'text-red-500' },
};

// Extract status for ProgressDot from field name
const getStatusFromField = (field: string): string => {
  if (field === 'count') return 'count';
  if (field === 'totalAmount') return 'total';
  if (field.includes('cash')) return 'cash';
  if (field.includes('mobile')) return 'mobile';
  if (field.includes('khaan')) return 'khaan';
  if (field.includes('golomt')) return 'golomt';
  if (field.includes('Invoice')) return 'invoice';
  if (field.includes('undefined')) return 'undefined';
  if (field.includes('barter')) return 'barter';
  if (field.includes('skip')) return 'skip';
  return field;
};

export const ProgressDot = ({ status }: { status: string }) => {
  const config = Object.values(FIELD_CONFIG).find(
    (config) => config.label.toLowerCase() === status.toLowerCase(),
  );

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

  if (summaryEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full my-4 text-muted-foreground">
        <p className="text-xs">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-start w-full my-4">
      {summaryEntries.map(([field, value]) => {
        const config = FIELD_CONFIG[field as keyof typeof FIELD_CONFIG];
        const label = config?.label || field.replace(/([A-Z])/g, ' $1').trim();
        const status = getStatusFromField(field);

        return (
          <div key={field} className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <ProgressDot status={status} />
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
