import { useQuery } from '@apollo/client';
import {
  IconActivity,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
} from '@tabler/icons-react';
import { cn, Empty, RelativeDateDisplay } from 'erxes-ui';
import { BROADCAST_TRACES } from '../../graphql/queries';

type TraceType = 'success' | 'failure' | 'regular';

const TRACE_CONFIG: Record<
  TraceType,
  { icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  success: {
    icon: IconCircleCheck,
    iconClass: 'text-green-600',
    bgClass: 'bg-green-100',
  },
  failure: {
    icon: IconCircleX,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-100',
  },
  regular: {
    icon: IconInfoCircle,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
  },
};

const TraceRow = ({ trace, isLast }: { trace: any; isLast: boolean }) => {
  const config = TRACE_CONFIG[trace.type as TraceType] ?? TRACE_CONFIG.regular;
  const Icon = config.icon;

  return (
    <div className="relative flex flex-row gap-3 pb-5">
      {!isLast && (
        <div className="absolute left-3 -translate-x-1/2 top-7 bottom-0 w-px bg-border" />
      )}

      <div className="relative z-10 shrink-0">
        <div
          className={cn(
            'size-6 rounded-full flex items-center justify-center border border-background',
            config.bgClass,
          )}
        >
          <Icon className={cn('size-4', config.iconClass)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-3 pt-0.5">
        <p className="min-w-0 flex-1 text-sm">{trace.message}</p>
        <RelativeDateDisplay value={trace.createdAt} asChild>
          <p className="shrink-0 text-xs leading-6 text-muted-foreground">
            <RelativeDateDisplay.Value value={trace.createdAt} />
          </p>
        </RelativeDateDisplay>
      </div>
    </div>
  );
};

export const BroadcastTabLogContent = ({ message }: { message: any }) => {
  const { data, loading } = useQuery(BROADCAST_TRACES, {
    variables: { engageMessageId: message?._id },
    skip: !message?._id,
  });

  const traces: any[] = (data?.engageBroadcastTraces ?? []).filter(Boolean);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-5">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {!loading && traces.length === 0 && (
          <Empty>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconActivity />
              </Empty.Media>
              <Empty.Title>No traces yet</Empty.Title>
              <Empty.Description>
                Traces will appear here once the broadcast starts sending.
              </Empty.Description>
            </Empty.Header>
          </Empty>
        )}

        <div className="w-full flex flex-col">
          {traces.map((trace, index) => (
            <TraceRow
              key={trace?._id}
              trace={trace}
              isLast={index === traces.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
