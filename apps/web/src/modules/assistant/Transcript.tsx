import { IconLoader2, IconRefresh } from '@tabler/icons-react';
import type { UIMessage } from 'ai';
import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { ApprovalCard } from './ApprovalCard';
import { CopyButton, textOf } from './CopyButton';
import { AnsweredCard, QuestionCard } from './QuestionCard';
import { Reply } from './Reply';
import { StepsGroup, ThinkingBlock } from './Steps';
import { type TranscriptRow, transcriptRows } from './transcriptRows';
import { UserMessage } from './UserMessage';

const ArtifactCard = lazy(() =>
  import('./artifacts/ArtifactCard').then((module) => ({ default: module.ArtifactCard })),
);

export interface TranscriptActions {
  busy: boolean;
  canEdit: boolean;
  onRespond: (approvalId: string, approved: boolean) => void;
  onAnswer: (toolCallId: string, answers: (string | string[])[]) => void;
  onRegenerate: () => void;
  onEdit: (message: UIMessage, text: string) => void;
}

const Row = ({ row, actions }: { row: TranscriptRow; actions: TranscriptActions }) => {
  switch (row.kind) {
    case 'text':
      return <Reply text={row.text} streaming={row.streaming} />;
    case 'thinking':
      return <ThinkingBlock text={row.text} streaming={row.streaming} />;
    case 'steps':
      return <StepsGroup steps={row.steps} />;
    case 'approval':
      return (
        <ApprovalCard
          procedure={row.procedure}
          input={row.input}
          disabled={actions.busy}
          onRespond={(approved) => actions.onRespond(row.approvalId, approved)}
        />
      );
    case 'question':
      return (
        <QuestionCard
          questions={row.questions}
          disabled={actions.busy}
          onAnswer={(answers) => actions.onAnswer(row.toolCallId, answers)}
        />
      );
    case 'answered':
      return <AnsweredCard answers={row.answers} />;
    case 'artifact':
      return (
        <Suspense fallback={<Spinner />}>
          <ArtifactCard artifact={row.artifact} />
        </Suspense>
      );
  }
};

const AssistantMessage = ({
  message,
  last,
  actions,
}: {
  message: UIMessage;
  last: boolean;
  actions: TranscriptActions;
}) => {
  const { t } = useTranslation('assistant');
  const rows = transcriptRows(message.parts);
  const text = textOf(message);
  const waiting = rows.some((row) => row.kind === 'approval' || row.kind === 'question');

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <Row key={row.key} row={row} actions={actions} />
      ))}
      {last && actions.canEdit && !waiting && (
        <div className="flex items-center gap-0.5">
          {text && <CopyButton text={text} />}
          <IconTip label={t('regenerate', 'Ask again')}>
            <Button
              variant="ghost"
              size="icon"
              tone="muted"
              aria-label={t('regenerate', 'Ask again')}
              onClick={actions.onRegenerate}
            >
              <IconRefresh className="size-3.5" />
            </Button>
          </IconTip>
        </div>
      )}
    </div>
  );
};

export const WorkingRow = ({ label }: { label: string }) => (
  <p className="flex items-center gap-2 text-sm text-muted-foreground">
    <IconLoader2 aria-hidden className="size-3.5 animate-spin" />
    {label}
  </p>
);

const useFollowBottom = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const element = scroller.current;
    const content = list.current;

    if (!element || !content) return undefined;

    const follow = new ResizeObserver(() => {
      if (pinned.current) element.scrollTop = element.scrollHeight;
    });

    follow.observe(content);

    return () => follow.disconnect();
  }, []);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;

    pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
  };

  return { scroller, list, onScroll };
};

export const Transcript = ({
  messages,
  actions,
  footer,
}: {
  messages: UIMessage[];
  actions: TranscriptActions;
  footer?: React.ReactNode;
}) => {
  const { scroller, list, onScroll } = useFollowBottom();
  const lastAssistant = messages.findLastIndex((message) => message.role === 'assistant');
  const lastUser = messages.findLastIndex((message) => message.role === 'user');

  return (
    <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
      <ol ref={list} className="flex flex-col gap-5 px-4 py-4">
        {messages.map((message, index) => (
          <li key={message.id}>
            {message.role === 'user' ? (
              <UserMessage
                message={message}
                onEdit={
                  index === lastUser && actions.canEdit
                    ? (text) => actions.onEdit(message, text)
                    : null
                }
              />
            ) : (
              <AssistantMessage
                message={message}
                last={index === lastAssistant}
                actions={actions}
              />
            )}
          </li>
        ))}
        {footer && <li>{footer}</li>}
      </ol>
    </div>
  );
};
