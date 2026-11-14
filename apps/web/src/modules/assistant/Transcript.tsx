import { AssistantMentions } from '@erxes/core-contract';
import { IconCopy, IconLoader2, IconRefresh } from '@tabler/icons-react';
import { Button, useToast } from 'erxes-ui';
import { isTextUIPart, type UIMessage } from 'ai';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { ApprovalCard } from './ApprovalCard';
import { MessageText } from './MessageText';
import { AnsweredCard, QuestionCard } from './QuestionCard';
import { Reply } from './Reply';
import { StepsGroup, ThinkingBlock } from './Steps';
import { type TranscriptRow, transcriptRows } from './transcriptRows';

export interface TranscriptActions {
  busy: boolean;
  onRespond: (approvalId: string, approved: boolean) => void;
  onAnswer: (toolCallId: string, answers: (string | string[])[]) => void;
  onRegenerate: () => void;
}

const textOf = (message: UIMessage) =>
  message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join('\n\n')
    .trim();

const CopyButton = ({ text }: { text: string }) => {
  const { t } = useTranslation('assistant');
  const { toast } = useToast();

  const copy = () =>
    void navigator.clipboard
      .writeText(text)
      .then(() => toast({ title: t('copied', 'Copied') }))
      .catch(() => toast({ variant: 'destructive', title: t('copy-failed', 'Could not copy') }));

  return (
    <IconTip label={t('copy', 'Copy')}>
      <Button
        variant="ghost"
        size="icon"
        tone="muted"
        aria-label={t('copy', 'Copy')}
        onClick={copy}
      >
        <IconCopy className="size-3.5" />
      </Button>
    </IconTip>
  );
};

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
  }
};

const mentionsOf = (message: UIMessage) =>
  message.parts.flatMap((part) =>
    part.type === 'data-mentions'
      ? (AssistantMentions.safeParse(part.data).data?.mentions ?? [])
      : [],
  );

const UserBubble = ({ message }: { message: UIMessage }) => {
  const text = textOf(message);

  return (
    <div className="group flex items-start justify-end gap-1">
      <div className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton text={text} />
      </div>
      <p className="max-w-5/6 rounded-xl rounded-br-sm bg-accent px-3 py-2 text-sm whitespace-pre-wrap break-words">
        <MessageText text={text} mentions={mentionsOf(message)} />
      </p>
    </div>
  );
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
      {last && !actions.busy && !waiting && (
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

export const Transcript = ({
  messages,
  actions,
  footer,
}: {
  messages: UIMessage[];
  actions: TranscriptActions;
  footer?: React.ReactNode;
}) => {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const pinned = useRef(true);
  const lastAssistant = messages.findLastIndex((message) => message.role === 'assistant');

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

  return (
    <div
      ref={scroller}
      onScroll={(event) => {
        const element = event.currentTarget;

        pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
      }}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <ol ref={list} className="flex flex-col gap-5 px-4 py-4">
        {messages.map((message, index) => (
          <li key={message.id}>
            {message.role === 'user' ? (
              <UserBubble message={message} />
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
