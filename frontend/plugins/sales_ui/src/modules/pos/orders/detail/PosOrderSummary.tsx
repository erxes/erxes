import { IconCircleFilled } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';

export const ProgressDot = ({
  status,
}: {
  status:
    | 'count'
    | 'total'
    | 'cash'
    | 'mobile'
    | 'khaan'
    | 'golomt'
    | 'invoice'
    | 'undefined'
    | 'barter'
    | 'skip';
}) => {
  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger>
          <IconCircleFilled
            className={cn('size-2', {
              'text-primary': status === 'count',
              'text-blue-500': status === 'total',
              'text-green-500': status === 'cash',
              'text-purple-500': status === 'mobile',
              'text-orange-500': status === 'khaan',
              'text-pink-500': status === 'golomt',
              'text-indigo-500': status === 'invoice',
              'text-gray-500': status === 'undefined',
              'text-yellow-500': status === 'barter',
              'text-red-500': status === 'skip',
            })}
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
  count: number;
  totalAmount: number;
  cashAmount?: number;
  mobileAmount?: number;
  khaanAmount?: number;
  golomtCardAmount?: number;
  invoice?: number;
  undefinedAmount?: number;
  barterAmount?: number;
  skipEbarimtAmount?: number;
}

export const PosOrderSummary = ({
  count = 0,
  totalAmount = 0,
  cashAmount = 0,
  mobileAmount = 0,
  khaanAmount = 0,
  golomtCardAmount = 0,
  invoice = 0,
  undefinedAmount = 0,
  barterAmount = 0,
  skipEbarimtAmount = 0,
}: PosOrderSummaryProps) => {
  return (
    <div className="flex flex-col gap-4 items-start w-full my-4">
      <div className="flex  items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="count" />
          <p className="text-xs font-medium text-muted-foreground">Count</p>
        </div>
        <p className="text-xs font-medium">{count}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="total" />
          <p className="text-xs font-medium text-muted-foreground">
            Total amount:
          </p>
        </div>
        <p className="text-xs font-medium">{totalAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="cash" />
          <p className="text-xs font-medium text-muted-foreground">
            Cash amount:
          </p>
        </div>
        <p className="text-xs font-medium">{cashAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="mobile" />
          <p className="text-xs font-medium text-muted-foreground">
            Mobile amount:
          </p>
        </div>
        <p className="text-xs font-medium">{mobileAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="khaan" />
          <p className="text-xs font-medium text-muted-foreground">Khaan:</p>
        </div>
        <p className="text-xs font-medium">{khaanAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="golomt" />
          <p className="text-xs font-medium text-muted-foreground">
            Golomt card:
          </p>
        </div>
        <p className="text-xs font-medium">{golomtCardAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="invoice" />
          <p className="text-xs font-medium text-muted-foreground">Invoice:</p>
        </div>
        <p className="text-xs font-medium">{invoice}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="undefined" />
          <p className="text-xs font-medium text-muted-foreground">
            Undefined:
          </p>
        </div>
        <p className="text-xs font-medium">{undefinedAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="barter" />
          <p className="text-xs font-medium text-muted-foreground">Barter:</p>
        </div>
        <p className="text-xs font-medium">{barterAmount}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <ProgressDot status="skip" />
          <p className="text-xs font-medium text-muted-foreground">
            Skip Ebarimt:
          </p>
        </div>
        <p className="text-xs font-medium">{skipEbarimtAmount}</p>
      </div>
    </div>
  );
};
