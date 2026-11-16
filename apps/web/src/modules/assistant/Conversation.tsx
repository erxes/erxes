import { IconAlertTriangle } from '@tabler/icons-react';
import { Alert, Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@erxes/core-contract/client';
import type { AssistantTab } from './assistantState';
import { chatErrorOf, needsKey } from './chatError';
import { Composer } from './Composer';
import { EmptyState, KeyNotice } from './EmptyState';
import { usePageContext } from './PageContextChip';
import { Transcript, WorkingRow } from './Transcript';
import type { AssistantTabs } from './useAssistantTabs';
import { useConversation } from './useConversation';

const ChatFailure = ({
  error,
  onRetry,
  onReload,
}: {
  error: Error;
  onRetry: () => void;
  onReload: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const failure = chatErrorOf(error);

  if (needsKey(failure)) return <KeyNotice />;

  return (
    <Alert variant="destructive">
      <IconAlertTriangle />
      <Alert.Title>{t('failed', 'The reply stopped')}</Alert.Title>
      <Alert.Description>
        <p>{failure.message}</p>
        <div className="mt-1 flex gap-2">
          <Button size="sm" onClick={onRetry}>
            {t('retry', 'Try again')}
          </Button>
          <Button variant="ghost" size="sm" onClick={onReload}>
            {t('reload', 'Reload conversation')}
          </Button>
        </div>
      </Alert.Description>
    </Alert>
  );
};

const Announcement = ({ pending }: { pending: 'approval' | 'question' | null }) => {
  const { t } = useTranslation('assistant');

  const text = {
    approval: t('needs-approval', 'The assistant needs your approval'),
    question: t('needs-answer', 'The assistant needs your answer'),
  };

  return <output className="sr-only">{pending ? text[pending] : ''}</output>;
};

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm">
    {children}
  </div>
);

const TranscriptFooter = ({ view }: { view: ReturnType<typeof useConversation> }) => {
  const { t } = useTranslation('assistant');
  const { chat } = view;

  return (
    <>
      {chat.status === 'submitted' && chat.messages.at(-1)?.role !== 'assistant' && (
        <WorkingRow label={t('working', 'Working on it…')} avatar />
      )}
      {view.runningElsewhere && (
        <WorkingRow label={t('running-elsewhere', 'Writing a reply… it appears here when done.')} />
      )}
      {chat.error && (
        <ChatFailure
          error={chat.error}
          onRetry={view.actions.onRegenerate}
          onReload={view.reload}
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
  const { chat, model } = view;

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
      role="tabpanel"
      id="assistant-conversation"
      aria-labelledby={`assistant-tab-${tab.key}`}
      className="flex min-h-0 flex-1 flex-col"
    >
      {chat.messages.length === 0 && !chat.error ? (
        <EmptyState
          noKey={model.noKey}
          record={context.page?.record?.type ?? null}
          onPick={(text) =>
            view.send({ text, mentions: [], page: context.page, files: [], selections: [] })
          }
        />
      ) : (
        <Transcript messages={chat.messages} footer={footer} actions={view.actions} />
      )}
      <Announcement pending={view.pending} />
      <Composer
        open={open}
        model={model}
        busy={view.busy || view.runningElsewhere}
        block={view.block}
        page={context.page}
        onHidePage={context.hide}
        onSend={view.send}
        onStop={view.stop}
      />
    </div>
  );
};
