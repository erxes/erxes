import {
  type Icon,
  IconCircle,
  IconCircleDot,
  IconCircleDashed,
  IconCircleCheck,
  IconCircleDashedCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { Badge, cn, Tooltip } from 'erxes-ui';
import { ITicketStatus } from '../types';

const STATUS_ICONS = [
  IconCircle,
  IconCircleDot,
  IconCircleDashed,
  IconCircleCheck,
  IconCircleDashedCheck,
  IconCircleX,
];

const STATUS_COLOR_CLASSNAMES = [
  'text-info',
  'text-warning',
  'text-warning',
  'text-success',
  'text-muted-foreground',
  'text-destructive',
];

const STATUS_BADGE_VARIANTS = [
  'info',
  'warning',
  'warning',
  'success',
  'secondary',
  'destructive',
] as const;

const getNumericType = (type: ITicketStatus['type']) =>
  (typeof type === 'string' ? Number.parseInt(type, 10) : type) - 1;

const TicketStatusInlineValueIcon = ({
  status,
  ...props
}: React.ComponentProps<Icon> & { status: ITicketStatus }) => {
  const numericType = getNumericType(status.type);
  const StatusIconComponent = STATUS_ICONS[numericType];

  if (!StatusIconComponent) {
    return null;
  }

  return (
    <StatusIconComponent {...props} className="size-4" color={status.color} />
  );
};

const TicketStatusInlineValueStatus = ({
  status,
}: {
  status: ITicketStatus;
}) => {
  const numericType = getNumericType(status.type);
  const badgeVariant = STATUS_BADGE_VARIANTS[numericType];
  return (
    <Badge variant={badgeVariant} className={cn('capitalize')}>
      {status.name}
    </Badge>
  );
};

const TicketStatusInlineValueRoot = ({
  status,
  hasName = false,
  ...props
}: React.ComponentProps<Icon> & {
  status: ITicketStatus;
  hasName?: boolean;
}) => {
  const numericType = getNumericType(status.type);
  const colorClassName = STATUS_COLOR_CLASSNAMES[numericType];

  if (!STATUS_ICONS[numericType]) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 flex-none rounded-sm p-1',
              colorClassName,
            )}
            style={{
              backgroundColor: `${status.color}25`,
            }}
          >
            <TicketStatusInlineValueIcon status={status} {...props} />
            {hasName ? <TicketStatusInlineValueStatus status={status} /> : null}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="capitalize">{status.name}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const TicketStatusInlineValue = Object.assign(
  TicketStatusInlineValueRoot,
  {
    Icon: TicketStatusInlineValueIcon,
    Status: TicketStatusInlineValueStatus,
  },
);
