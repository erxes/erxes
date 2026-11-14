import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { isApiError } from '~/lib/api';
import type { AssistantTab } from './assistantState';
import { chatFailureOf, needsKey } from './chatError';
import { Composer } from './Composer';
import { EmptyState, KeyNotice } from './EmptyState';
import { usePageContext } from './PageContextChip';
import { Transcript, WorkingRow } from './Transcript';
import type { AssistantTabs } from './useAssistantTabs';
import { useConversation } from './useConversation';

const ChatFailure = ({ error, onReload }: { error: Error; onReload: () => void }) => {
  const { t } = useTranslation('assistant');
  const failure = chatFailureOf(error);

  if (needsKey(failure)) return <KeyNotice />;

  return (
    <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border p-3 text-sm">
      <p className="text-destructive-text">{failure.message}</p>
      <Button variant="outline" size="sm" onClick={onReload}>
        {t('reload', 'Reload conversation')}
      </Button>
    </div>
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
  const view = useConversation(tab, tabs, open);
  const context = usePageContext();
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

  const footer = (
    <>
      {chat.status === 'submitted' && <WorkingRow label={t('working', 'Working on it…')} />}
      {view.runningElsewhere && (
        <WorkingRow label={t('running-elsewhere', 'Writing a reply… it appears here when done.')} />
      )}
      {chat.error && <ChatFailure error={chat.error} onReload={view.reload} />}
    </>
  );

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
          onPick={(text) =>
            view.send({ text, mentions: [], page: context.page, files: [], selections: [] })
          }
        />
      ) : (
        <Transcript messages={chat.messages} footer={footer} actions={view.actions} />
      )}
      <Announcement pending={view.pending} />
      <Composer
        model={model}
        busy={view.busy}
        block={view.block}
        page={context.page}
        onHidePage={context.hide}
        onSend={view.send}
        onStop={() => void chat.stop()}
      />
    </div>
  );
};
