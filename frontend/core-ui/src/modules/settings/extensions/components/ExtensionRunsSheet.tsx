import { useCallback } from 'react';
import { Badge, Empty, Sheet, Skeleton, Table } from 'erxes-ui';
import { extensionsApi } from '../extensionsApi';
import { useExtensionsQuery } from '../hooks/useExtensionsQuery';
import { ExtensionRun } from '../types';

const STATUS_VARIANT = {
  ok: 'success',
  error: 'destructive',
  timeout: 'warning',
} as const satisfies Record<ExtensionRun['status'], string>;

const TRIGGER_LABEL = {
  call: 'Call',
  cron: 'Schedule',
  webhook: 'Webhook',
  event: 'Event',
} as const satisfies Record<NonNullable<ExtensionRun['trigger']>, string>;

const RunsNotice = ({ children }: Readonly<{ children: string }>) => (
  <Empty className="min-h-60">
    <Empty.Header>
      <Empty.Title>{children}</Empty.Title>
    </Empty.Header>
  </Empty>
);

const ExtensionRuns = ({ extId }: Readonly<{ extId: string }>) => {
  const load = useCallback(() => extensionsApi.runs(extId), [extId]);
  const { data, error, loading } = useExtensionsQuery(load);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return <RunsNotice>{error?.message ?? 'Could not load runs'}</RunsNotice>;
  }

  if (data.length === 0) {
    return <RunsNotice>No runs in the last 30 days</RunsNotice>;
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Time</Table.Head>
          <Table.Head>Function</Table.Head>
          <Table.Head>Trigger</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head className="text-right">Duration</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((run) => (
          <Table.Row key={run._id}>
            <Table.Cell className="whitespace-nowrap">
              {new Date(run.createdAt).toLocaleString()}
            </Table.Cell>
            <Table.Cell>
              <span className="font-mono">{run.fn}</span>
              <span className="text-muted-foreground"> {run.version}</span>
              {run.error && (
                <div className="text-xs break-all text-destructive">
                  {run.error.code}: {run.error.message}
                </div>
              )}
            </Table.Cell>
            <Table.Cell>
              <Badge variant="secondary">
                {TRIGGER_LABEL[run.trigger ?? 'call']}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={STATUS_VARIANT[run.status]}>{run.status}</Badge>
            </Table.Cell>
            <Table.Cell className="text-right tabular-nums">
              {run.ms} ms
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export function ExtensionRunsSheet({
  extId,
  open,
  onClose,
}: Readonly<{ extId: string; open: boolean; onClose: () => void }>) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.View className="sm:max-w-2xl flex flex-col gap-0">
        <Sheet.Header>
          <Sheet.Title>{extId} run log</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0 overflow-auto p-4">
          {open && <ExtensionRuns extId={extId} />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
