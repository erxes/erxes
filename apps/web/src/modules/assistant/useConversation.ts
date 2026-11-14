import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { isDataUIPart, isTextUIPart, safeValidateUIMessages, type UIMessage } from 'ai';
import { useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { orpc } from '~/lib/api';
import { type AssistantTab, assistantUnreadState } from './assistantState';
import { type ChatSession, sessionFor } from './chatSession';
import type { ComposerBlock, ComposerMessage } from './Composer';
import { pendingAction } from './transcriptRows';
import type { AssistantTabs } from './useAssistantTabs';
import { useModelRun } from './useModelRun';
import { useThread } from './useThread';

type Status = ReturnType<typeof useChat>['status'];

const isBusy = (status: Status) => status === 'submitted' || status === 'streaming';

const useStoredMessages = (session: ChatSession, threadId: string | null, status: Status) => {
  const thread = useThread(threadId);
  const [loaded, setLoaded] = useState(threadId === null);

  useEffect(() => {
    const stored = thread.data;

    if (!stored || isBusy(status)) return undefined;

    let current = true;

    const apply = async () => {
      const result = await safeValidateUIMessages({
        messages: stored.messages.map(({ id, role, parts }) => ({ id, role, parts })),
      });

      if (!current) return;

      if (result.success) session.showStored(result.data);

      setLoaded(true);
    };

    void apply();

    return () => {
      current = false;
    };
  }, [thread.data, status, session]);

  return { thread, loaded };
};

const useUnreadWhenClosed = (status: Status, open: boolean) => {
  const setUnread = useSetAtom(assistantUnreadState);
  const previous = useRef(status);

  useEffect(() => {
    if (isBusy(previous.current) && !isBusy(status) && !open) setUnread(true);

    previous.current = status;
  }, [status, open, setUnread]);
};

const lastQuestion = (messages: UIMessage[]) =>
  messages
    .findLast((message) => message.role === 'user')
    ?.parts.filter((part) => isTextUIPart(part) || isDataUIPart(part));

const partsOf = ({ text, mentions, page }: ComposerMessage): UIMessage['parts'] => [
  { type: 'text', text },
  ...(mentions.length ? [{ type: 'data-mentions' as const, data: { mentions } }] : []),
  ...(page ? [{ type: 'data-page' as const, data: page }] : []),
];

export const useConversation = (tab: AssistantTab, tabs: AssistantTabs, open: boolean) => {
  const client = useQueryClient();
  const model = useModelRun();
  const [session] = useState(() => sessionFor(tab, tabs.setThreadId));
  const chat = useChat({ chat: session.chat });
  const { thread, loaded } = useStoredMessages(session, tab.threadId, chat.status);
  const busy = isBusy(chat.status);
  const pending = pendingAction(chat.messages.at(-1));
  const runningElsewhere = !busy && thread.data?.running === true;

  useEffect(() => {
    session.chooseModel(model.run);
  }, [session, model.run]);

  useUnreadWhenClosed(chat.status, open);

  const sendParts = (parts: UIMessage['parts']) => {
    chat.clearError();
    void chat.sendMessage({ parts });
  };

  const send = (message: ComposerMessage) => sendParts(partsOf(message));

  const block: ComposerBlock = model.noKey
    ? 'no-key'
    : (pending ?? (runningElsewhere ? 'running' : null));

  return {
    model,
    chat,
    thread,
    loaded,
    busy,
    pending,
    runningElsewhere,
    block,
    send,
    reload: () => {
      chat.clearError();
      void client.invalidateQueries({ queryKey: orpc.assistant.key() });
    },
    actions: {
      busy,
      onRespond: (approvalId: string, approved: boolean) =>
        void session.respond(approvalId, approved),
      onAnswer: (toolCallId: string, answers: (string | string[])[]) =>
        void session.answer(toolCallId, answers),
      onRegenerate: () => {
        const question = lastQuestion(chat.messages);

        if (question?.length) sendParts(question);
      },
    },
  };
};
