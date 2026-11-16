import { useChat } from '@ai-sdk/react';
import { matchQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AssistantMentions, type AssistantPage } from '@erxes/core-contract';
import { getToolName, isDataUIPart, isToolUIPart, type UIMessage } from 'ai';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { orpc } from '@erxes/core-contract/client';
import {
  type AssistantTab,
  assistantAskState,
  assistantUnreadState,
  takeAskAction,
} from './assistantState';
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
  const [startedEmpty] = useState(threadId === null);
  const stored = thread.data;
  const idle = !isBusy(status);

  useLayoutEffect(() => {
    if (stored?.messages && idle) session.showStored(stored.messages);
  }, [stored, idle, session]);

  return { thread, loaded: startedEmpty || stored !== undefined };
};

const useUnreadWhenClosed = (status: Status, open: boolean) => {
  const setUnread = useSetAtom(assistantUnreadState);
  const previous = useRef(status);

  useEffect(() => {
    if (isBusy(previous.current) && !isBusy(status) && !open) setUnread(true);

    previous.current = status;
  }, [status, open, setUnread]);
};

const calledApi = (message: UIMessage | undefined) =>
  message?.role === 'assistant' &&
  message.parts.some(
    (part) =>
      isToolUIPart(part) && getToolName(part) === 'callApi' && part.state === 'output-available',
  );

const useRefreshAfterChanges = (status: Status, last: UIMessage | undefined) => {
  const client = useQueryClient();
  const previous = useRef(status);

  useEffect(() => {
    if (isBusy(previous.current) && !isBusy(status) && calledApi(last)) {
      void client.invalidateQueries({
        predicate: (query) => !matchQuery({ queryKey: orpc.assistant.key() }, query),
      });
    }

    previous.current = status;
  }, [status, last, client]);
};

const partsOf = ({
  text,
  mentions,
  page,
  files,
  selections,
}: ComposerMessage): UIMessage['parts'] => [
  ...(text ? [{ type: 'text' as const, text }] : []),
  ...(mentions.length ? [{ type: 'data-mentions' as const, data: { mentions } }] : []),
  ...(page ? [{ type: 'data-page' as const, data: page }] : []),
  ...(files.length ? [{ type: 'data-files' as const, data: { files } }] : []),
  ...(selections.length ? [{ type: 'data-selections' as const, data: { selections } }] : []),
];

const editedParts = (message: UIMessage, text: string): UIMessage['parts'] => [
  { type: 'text', text },
  ...message.parts.flatMap((part) => {
    if (part.type !== 'data-mentions') return isDataUIPart(part) ? [part] : [];

    const mentions = (AssistantMentions.safeParse(part.data).data?.mentions ?? []).filter(
      (mention) => text.includes(`@${mention.label}`),
    );

    return mentions.length ? [{ type: 'data-mentions' as const, data: { mentions } }] : [];
  }),
];

/** Sends a question asked from the top bar search, once, in a blank chat. */
const useAskedElsewhere = (session: ChatSession, blank: boolean, page: AssistantPage | null) => {
  const ask = useAtomValue(assistantAskState);
  const takeAsk = useSetAtom(takeAskAction);

  useEffect(() => {
    if (!ask || !blank) return;

    const text = takeAsk();

    if (text) {
      const parts = partsOf({ text, mentions: [], page, files: [], selections: [] });

      void session.chat.sendMessage({ parts });
    }
  }, [ask, blank, page, session, takeAsk]);
};

export const useConversation = (
  tab: AssistantTab,
  tabs: AssistantTabs,
  open: boolean,
  page: AssistantPage | null,
) => {
  const client = useQueryClient();
  const model = useModelRun();
  const [session] = useState(() => sessionFor(tab, tabs.setThreadId));
  const chat = useChat({ chat: session.chat });
  const { thread, loaded } = useStoredMessages(session, tab.threadId, chat.status);
  const busy = isBusy(chat.status);
  const pending = pendingAction(chat.messages.at(-1));
  const runningElsewhere = !busy && thread.data?.running === true;
  const stopThread = useMutation(orpc.assistant.stopThread.mutationOptions());
  const stopServer = (id: string) => stopThread.mutate({ id });

  useEffect(() => {
    session.chooseModel(model.run);
  }, [session, model.run]);

  useUnreadWhenClosed(chat.status, open);
  useRefreshAfterChanges(chat.status, chat.messages.at(-1));
  useAskedElsewhere(session, tab.threadId === null && loaded && chat.messages.length === 0, page);

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
    stop: () => {
      if (runningElsewhere && session.threadId) stopServer(session.threadId);
      else session.stop(stopServer);
    },
    reload: () => {
      chat.clearError();
      void client.invalidateQueries({ queryKey: orpc.assistant.key() });
    },
    actions: {
      busy,
      canEdit: !busy && !runningElsewhere && !model.noKey && session.threadId !== null,
      onRespond: (approvalId: string, approved: boolean) =>
        void session.respond(approvalId, approved),
      onAnswer: (toolCallId: string, answers: (string | string[])[]) =>
        void session.answer(toolCallId, answers),
      onRegenerate: () => {
        chat.clearError();
        void chat.regenerate();
      },
      onEdit: (message: UIMessage, text: string) => {
        chat.clearError();
        void chat.sendMessage({ messageId: message.id, parts: editedParts(message, text) });
      },
    },
  };
};
