import { IconArrowDown } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantTurn, type TranscriptActions } from './TaskCard';
import { type TranscriptMessage, userText } from './transcriptRows';
import { UserMessage } from './UserMessage';

export { type TranscriptActions, WorkingRow } from './TaskCard';

const LatestButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('assistant');

  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute bottom-3 left-1/2 -translate-x-1/2"
      onClick={onClick}
    >
      <IconArrowDown className="size-3.5" />
      {t('latest', 'Latest')}
    </Button>
  );
};

const useFollowBottom = (asked: string | undefined) => {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const pinned = useRef(true);
  const top = useRef(0);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const element = scroller.current;
    const content = list.current;

    if (!element || !content) return undefined;

    const follow = new ResizeObserver(() => {
      if (pinned.current) element.scrollTop = element.scrollHeight;
    });

    follow.observe(content);
    follow.observe(element);

    return () => follow.disconnect();
  }, []);

  useEffect(() => {
    const element = scroller.current;

    if (!element || !asked) return;

    pinned.current = true;
    element.scrollTop = element.scrollHeight;
  }, [asked]);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const gap = element.scrollHeight - element.scrollTop - element.clientHeight;

    if (element.scrollTop < top.current && gap > 1) pinned.current = false;
    else if (gap < 48) pinned.current = true;

    top.current = element.scrollTop;
    setAway(gap > 240);
  };

  const toLatest = () => {
    pinned.current = true;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  };

  return { scroller, list, onScroll, away, toLatest };
};

const askedBefore = (messages: TranscriptMessage[], index: number) => {
  const asked = messages.slice(0, index).findLast((message) => message.role === 'user');

  return asked?.role === 'user' ? userText(asked.parts) : '';
};

export const Transcript = ({
  messages,
  actions,
  footer,
}: {
  messages: TranscriptMessage[];
  actions: TranscriptActions;
  footer?: React.ReactNode;
}) => {
  const asked = messages.findLast((message) => message.role === 'user')?.key;
  const { scroller, list, onScroll, away, toLatest } = useFollowBottom(asked);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        <ol ref={list} className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-4">
          {messages.map((message, index) => (
            <li key={message.key}>
              {message.role === 'user' ? (
                <UserMessage parts={message.parts} />
              ) : (
                <AssistantTurn
                  rows={message.rows}
                  asked={askedBefore(messages, index)}
                  last={index === messages.length - 1}
                  actions={actions}
                />
              )}
            </li>
          ))}
          {footer && <li>{footer}</li>}
        </ol>
      </div>
      {away && <LatestButton onClick={toLatest} />}
    </div>
  );
};
