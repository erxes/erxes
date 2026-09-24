import { AutomationExecutionDetailTabs } from '@/automations/components/builder/history/components/AutomationExecutionDetailView';
import { AutomationExecutionDetailProvider } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { AutomationHistoryDetailProvider } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { useAutomationDetail } from '@/automations/hooks/useAutomationDetail';
import { IAutomation } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IconRefresh, IconUsers, IconX } from '@tabler/icons-react';
import { ReactFlowProvider } from '@xyflow/react';
import {
  Button,
  cn,
  Empty,
  RecordTable,
  Resizable,
  Select,
  Skeleton,
  Tooltip,
} from 'erxes-ui';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY } from '../../../constants';
import { useBroadcastRunRecipients } from '../../../hooks/useBroadcastRunRecipients';
import { TBroadcastRecipient } from '../../../types';
import { recipientReason } from '../../../utils/recipientOutcome';
import {
  buildRecipientColumns,
  recipientDisplayName,
} from '../recipients/BroadcastRecipientColumns';
import { BroadcastRecipientEmail } from '../recipients/BroadcastRecipientEmail';
import { BroadcastRecipientFilter } from '../recipients/BroadcastRecipientFilter';
import { useTranslation } from 'react-i18next';

type TCampaign = { _id?: string; workflowAutomationId?: string } | null;

/**
 * Who this campaign wrote down when it launched, and what became of each.
 *
 * The manifest is the list because it is the complete one: a person the
 * campaign decided against — unsubscribed, already reached, gone — never
 * produced a flow and appears nowhere else. Selecting a row opens that
 * person's flow underneath, which is where "how far did it get" is answered.
 */
export const BroadcastTabRecipientsContent = ({
  message,
}: {
  message: TCampaign;
}) => {
  const { automation, loading } = useAutomationDetail(
    message?.workflowAutomationId,
  );

  // Every method keeps a manifest; only a flow has steps to open underneath
  // one of its rows, and only that needs the automation loaded first.
  if (message?.workflowAutomationId && (loading || !automation)) {
    return <Skeleton className="m-5 h-[32rem] flex-1" />;
  }

  return <BroadcastRecipients message={message} automation={automation} />;
};

/**
 * Mounted once the automation has loaded: the flow's nodes read their step out
 * of a form seeded from it, and a node drawn without one throws reaching for
 * its configuration.
 */
const BroadcastRecipients = ({
  message,
  automation,
}: {
  message: TCampaign;
  automation?: IAutomation;
}) => {
  const { t } = useTranslation('broadcasts');
  const {
    form,
    runs,
    runsLoading,
    selectedRun,
    setRunId,
    selected,
    setSelected,
    executionId,
    list,
    totalCount,
    loading,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    hasChanges,
    reload,
  } = useBroadcastRunRecipients(message?._id, automation);

  if (runsLoading) {
    return <Skeleton className="m-5 h-[32rem] flex-1" />;
  }

  if (!runs.length) {
    return (
      <div className="flex-1 px-8 py-5">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconUsers />
            </Empty.Media>
            <Empty.Title>{t('recipients.empty-title')}</Empty.Title>
            <Empty.Description>{t('recipients.empty-body')}</Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  return (
    <FlowProviders automation={automation} form={form}>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex flex-none items-center justify-between gap-3 border-b px-4 py-2">
          {runs.length > 1 ? (
            <Select value={selectedRun?._id} onValueChange={setRunId}>
              <Select.Trigger className="h-8 w-56">
                <Select.Value placeholder={t('recipients.select-run')} />
              </Select.Trigger>
              <Select.Content>
                {runs.map((run) => (
                  <Select.Item key={run._id} value={run._id}>
                    Run {run.runCount} · {run.totalCount} recipients
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          ) : (
            <p className="text-sm font-medium">{t('tab.recipients')}</p>
          )}

          <div className="flex items-center gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">
              {list.length < totalCount
                ? t('recipients.loaded-of', {
                    loaded: list.length,
                    total: totalCount.toLocaleString(),
                  })
                : totalCount.toLocaleString()}
            </p>

            {/* A run moves while this is open. Further down the list it is not
                asked again unasked, so the change is offered instead. */}
            {hasChanges ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                disabled={loading}
                onClick={reload}
              >
                <IconRefresh className="size-4" />
                {t('recipients.new-changes')}
              </Button>
            ) : (
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={t('recipients.refresh')}
                    disabled={loading}
                    onClick={reload}
                  >
                    <IconRefresh
                      className={cn('size-4', loading && 'animate-spin')}
                    />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content side="bottom">
                  {t('recipients.refresh')}
                </Tooltip.Content>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="flex flex-none items-center gap-2 border-b px-4 py-2">
          <BroadcastRecipientFilter />
        </div>

        <Resizable.PanelGroup direction="vertical" className="min-h-0 flex-1">
          <Resizable.Panel
            defaultSize={selected ? 55 : 100}
            minSize={30}
            className="min-h-0"
          >
            <RecordTable.Provider
              columns={buildRecipientColumns(list, {
                // Read off the campaign, not off the loaded automation: a
                // campaign either has a flow or it does not, whether or not
                // that flow has finished loading.
                hasFlow: !!message?.workflowAutomationId,
              })}
              data={list}
              className="h-full min-h-0"
            >
              <RecordTable.CursorProvider
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                dataLength={list.length}
                sessionKey={BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY}
              >
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.CursorBackwardSkeleton
                      handleFetchMore={handleFetchMore}
                    />
                    {loading && <RecordTable.RowSkeleton rows={10} />}
                    <RecordTable.RowList
                      Row={RecipientRow(selected, setSelected)}
                    />
                    <RecordTable.CursorForwardSkeleton
                      handleFetchMore={handleFetchMore}
                    />
                  </RecordTable.Body>
                </RecordTable>
              </RecordTable.CursorProvider>
            </RecordTable.Provider>
          </Resizable.Panel>

          {!!selected && (
            <>
              <Resizable.Handle withHandle />
              <Resizable.Panel
                defaultSize={45}
                minSize={25}
                className="min-h-0"
              >
                <div className="flex h-full min-h-0 flex-col bg-background">
                  <div className="flex h-10 flex-none items-center gap-2 border-b px-3">
                    <h3 className="flex-auto truncate text-sm font-semibold">
                      {recipientDisplayName(selected)}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('recipients.close')}
                      onClick={() => setSelected(null)}
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>

                  <div className="min-h-0 flex-1">
                    {/* A campaign without a flow answers for itself: the
                        message that went out, and what became of it. */}
                    {!message?.workflowAutomationId ? (
                      <BroadcastRecipientEmail recipientId={selected._id} />
                    ) : executionId ? (
                      <AutomationHistoryDetailProvider
                        key={executionId}
                        executionId={executionId}
                      >
                        <AutomationExecutionDetailProvider>
                          <div className="h-full min-h-0 bg-background">
                            <AutomationExecutionDetailTabs defaultTab="flow" />
                          </div>
                        </AutomationExecutionDetailProvider>
                      </AutomationHistoryDetailProvider>
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center">
                        <p className="max-w-md text-sm text-muted-foreground">
                          {recipientReason(selected, t) ||
                            t('recipients.no-flow')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Resizable.Panel>
            </>
          )}
        </Resizable.PanelGroup>
      </div>
    </FlowProviders>
  );
};

/**
 * The flow view reads its steps out of a form seeded from the automation, so
 * it needs these around it. A campaign without a flow has no such panel, and
 * nothing to seed them from.
 */
const FlowProviders = ({
  automation,
  form,
  children,
}: {
  automation?: IAutomation;
  form: UseFormReturn<TAutomationBuilderForm>;
  children: React.ReactNode;
}) => {
  if (!automation) {
    return <>{children}</>;
  }

  return (
    <AutomationProvider scoped detail={automation}>
      <ReactFlowProvider>
        <FormProvider {...form}>{children}</FormProvider>
      </ReactFlowProvider>
    </AutomationProvider>
  );
};

/** Reuses the record table's own selected-row styling for the opened flow. */
const RecipientRow =
  (
    selected: TBroadcastRecipient | null,
    onSelect: (recipient: TBroadcastRecipient) => void,
  ) =>
  ({ original, ...props }: React.ComponentProps<typeof RecordTable.Row>) =>
    (
      <RecordTable.Row
        {...props}
        original={original}
        className="cursor-pointer"
        onClick={() => onSelect(original)}
        {...(selected?._id === original?._id
          ? { 'data-state': 'selected' }
          : {})}
      />
    );
