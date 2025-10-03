import { LogDetailView } from '@/logs/components/LogDetailView';
import { Sheet, useQueryState } from 'erxes-ui';

export function LogDetailSheet() {
  const [logId, setLogId] = useQueryState<string>('logId');

  return (
    <Sheet open={!!logId} onOpenChange={() => logId && setLogId(null)}>
      <Sheet.View className="md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
        <Sheet.Header>
          <Sheet.Title>Log Summary</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0  overflow-hidden">
          {logId && <LogDetailView logId={logId} />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
