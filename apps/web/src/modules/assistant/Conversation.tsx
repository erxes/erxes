import { IconAlertTriangle } from '@tabler/icons-react';
import { Alert, Button, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasContext, useWide } from './canvas';
import { isApiError, messageOf } from '@erxes/core-contract/client';
import type { AssistantTab } from './assistantState';
import { Composer } from './Composer';
import { EmptyState, KeyNotice } from './EmptyState';
import { usePageContext } from './PageContextChip';
import { Transcript, WorkingRow } from './Transcript';
import type { AssistantTabs } from './useAssistantTabs';
import { useConversation } from './useConversation';

const ChatFailure = ({
  message,
  action,
}: {
  message: string;
  action?: { label: string; onClick: () => void };
}) => {
  const { t } = useTranslation('assistant');

  return (
    <Alert variant="destructive">
      <IconAlertTriangle />
      <Alert.Title>{t('failed', 'The reply stopped')}</Alert.Title>
      <Alert.Description>
        <p>{message}</p>
        {action && (
          <Button className="mt-1 self-start" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Alert.Description>
    </Alert>
  );
};

const SendFailure = ({ error, onRetry }: { error: Error; onRetry: () => void }) => {
  const { t } = useTranslation('assistant');

  if (
    isApiError(error, 'ASSISTANT_NO_CONNECTION') ||
    isApiError(error, 'ASSISTANT_KEY_UNREADABLE')
  ) {
    return <KeyNotice />;
  }

  return (
    <ChatFailure
      message={messageOf(error)}
      action={{ label: t('retry', 'Try again'), onClick: onRetry }}
    />
  );
};

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm">
    {children}
  </div>
);

const TranscriptFooter = ({ view }: { view: ReturnType<typeof useConversation> }) => {
  const { t } = useTranslation('assistant');
  const { transcript, watch } = view;

  return (
    <>
      {view.busy && transcript.messages.at(-1)?.role !== 'assistant' && (
        <WorkingRow label={t('working', 'Working on it…')} />
      )}
      {transcript.failure && <ChatFailure message={transcript.failure} />}
      {view.sendError && <SendFailure error={view.sendError} onRetry={view.retry} />}
      {watch.error && (
        <ChatFailure
          message={messageOf(watch.error)}
          action={{
            label: t('reload', 'Reload conversation'),
            onClick: () => void watch.refetch(),
          }}
        />
      )}
    </>
  );
};

export const Conversation = ({
  tab,
  tabs,
  open,
}: {
  tab: AssistantTab;
  tabs: AssistantTabs;
  open: boolean;
}) => {
  const { t } = useTranslation('assistant');
  const context = usePageContext();
  const view = useConversation(tab, tabs, open, context.page);
  const { model, transcript } = view;
  const { setFrame, wide } = useWide();
  const [canvas, setCanvas] = useState<HTMLElement | null>(null);

  if (isApiError(view.thread.error, 'NOT_FOUND')) {
    return (
      <Centered>
        <p>{t('gone', 'This conversation was deleted.')}</p>
        <Button variant="outline" size="sm" onClick={() => tabs.closeTab(tab.key)}>
          {t('close-tab-short', 'Close tab')}
        </Button>
      </Centered>
    );
  }

  if (!view.loaded) {
    return (
      <Centered>
        <Spinner />
      </Centered>
    );
  }

  const footer = <TranscriptFooter view={view} />;

  return (
    <div
      ref={setFrame}
      role="tabpanel"
      id="assistant-conversation"
      aria-labelledby={`assistant-tab-${tab.key}`}
      className="flex min-h-0 flex-1"
    >
      <CanvasContext value={wide ? canvas : null}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {transcript.messages.length === 0 &&
          !view.busy &&
          !view.sendError &&
          !view.watch.error ? (
            <EmptyState
              noKey={model.noKey}
              record={context.page?.record?.type ?? null}
              onPick={(text) =>
                view.send({ text, mentions: [], page: context.page, files: [], selections: [] })
              }
            />
          ) : (
            <Transcript messages={transcript.messages} footer={footer} actions={view.actions} />
          )}
          <Composer
            open={open}
            model={model}
            busy={view.busy}
            block={view.block}
            page={context.page}
            onHidePage={context.hide}
            onSend={view.send}
            onStop={view.stop}
          />
        </div>
      </CanvasContext>
      {wide && (
        <aside
          ref={setCanvas}
          aria-label={t('canvas', 'Canvas')}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto border-l bg-muted/40 p-4 empty:hidden"
        />
      )}
    </div>
  );
};
