import {
  assistantChatMessagesState,
  IAssistantChatMessage,
} from '@/side-panel/states/assistantChatState';
import { IconArrowUp, IconSparkles } from '@tabler/icons-react';
import { Button, cn, ScrollArea, Textarea } from 'erxes-ui';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordSidePanel } from 'ui-modules';

const AssistantAvatar = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'flex size-7 flex-none items-center justify-center rounded-md bg-primary/10 text-primary',
      className,
    )}
  >
    <IconSparkles className="size-4" />
  </span>
);

const ChatMessage = ({ message }: { message: IAssistantChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-150 motion-reduce:animate-none',
        isUser && 'justify-end',
      )}
    >
      {!isUser && <AssistantAvatar />}
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm',
          isUser
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-muted',
        )}
      >
        {message.text}
      </div>
    </div>
  );
};

const ChatWelcome = ({ onPick }: { onPick: (prompt: string) => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel.chat' });
  const suggestions = [
    t('suggestion-summary', 'Summarize my open deals'),
    t('suggestion-leads', 'Which leads need a follow-up?'),
    t('suggestion-email', 'Draft a welcome email for a new customer'),
  ];

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <AssistantAvatar className="size-10 rounded-xl [&>svg]:size-5" />
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">
          {t('welcome-title', 'How can I help?')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            'welcome-description',
            'Ask about your customers, deals and tasks.',
          )}
        </p>
      </div>
      <div className="flex w-full flex-col gap-1.5">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            className="h-auto justify-start whitespace-normal py-2 text-left font-normal"
            onClick={() => onPick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

/**
 * The assistant chat in the side panel (`?panel=/chat`). Only the layout:
 * messages stay in this session and no assistant answers yet.
 */
export const SidePanelChat = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel.chat' });
  const [messages, setMessages] = useAtom(assistantChatMessagesState);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Focus without scrolling: the panel is still sliding in, and a scrolling
  // focus would drag the layout with it.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Scroll only the message list; scrollIntoView would also scroll the app's
  // own containers and shift the whole layout.
  useEffect(() => {
    const viewport = endRef.current?.closest(
      '[data-radix-scroll-area-viewport]',
    );

    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();

    if (!text) return;

    setMessages((current) => [
      ...current,
      { id: nanoid(), role: 'user', text },
    ]);
    setDraft('');
    inputRef.current?.focus({ preventScroll: true });
  };

  const pickSuggestion = (prompt: string) => {
    setDraft(prompt);
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <RecordSidePanel.Header
        avatar={<AssistantAvatar />}
        title={t('title', 'Assistant')}
        onClose={onClose}
      />
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        {messages.length === 0 ? (
          <ChatWelcome onPick={pickSuggestion} />
        ) : (
          <div className="flex flex-col gap-3 p-3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </ScrollArea>
      <form
        className="flex-none border-t p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 pl-3 transition-[box-shadow] focus-within:shadow-focus">
          <Textarea
            ref={inputRef}
            value={draft}
            rows={1}
            placeholder={t('placeholder', 'Ask anything…')}
            className="max-h-40 min-h-7 flex-1 resize-none border-0 bg-transparent p-0 py-1 shadow-none focus-visible:shadow-none"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="size-7 flex-none rounded-lg"
            disabled={!draft.trim()}
            aria-label={t('send', 'Send')}
          >
            <IconArrowUp className="size-4" />
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
          {t('not-connected', 'The assistant is not connected yet.')}
        </p>
      </form>
    </>
  );
};
