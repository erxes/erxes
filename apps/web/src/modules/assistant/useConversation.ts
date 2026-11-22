import type { AssistantAction, AssistantMessagePart, AssistantPage } from '@erxes/core-contract';
import { matchQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { messageOf, orpc } from '@erxes/core-contract/client';
import {
  type AssistantTab,
  assistantAskState,
  assistantUnreadState,
  takeAskAction,
} from './assistantState';
import type { ComposerBlock, ComposerMessage } from './Composer';
import { sendRequest } from './modelChoice';
import { transcriptOf } from './transcriptRows';
import type { AssistantTabs } from './useAssistantTabs';
import { useModelRun } from './useModelRun';
import { conversationOptions, useThread } from './useThread';

const EMPTY_VIEW = { entries: [], docs: {} };

const useRunEnded = (running: boolean, onEnded: () => void) => {
  const previous = useRef(running);
  const ended = useEffectEvent(onEnded);

  useEffect(() => {
    if (previous.current && !running) ended();

    previous.current = running;
  }, [running]);
};

const partsOf = ({
  text,
  mentions,
  page,
  files,
  selections,
}: ComposerMessage): AssistantMessagePart[] => [
  ...(text ? [{ type: 'text', text }] : []),
  ...(mentions.length ? [{ type: 'data-mentions', data: { mentions } }] : []),
  ...(page ? [{ type: 'data-page', data: page }] : []),
  ...(files.length ? [{ type: 'data-files', data: { files } }] : []),
  ...(selections.length ? [{ type: 'data-selections', data: { selections } }] : []),
];

export const useConversation = (
  tab: AssistantTab,
  tabs: AssistantTabs,
  open: boolean,
  page: AssistantPage | null,
) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const setUnread = useSetAtom(assistantUnreadState);
  const model = useModelRun();
  const thread = useThread(tab.threadId);
  const watch = useQuery(conversationOptions(tab.threadId));
  const [startedEmpty] = useState(tab.threadId === null);
  const transcript = transcriptOf(watch.data ?? EMPTY_VIEW);
  const stopWanted = useRef(false);
  const onError = (error: Error) => toast({ variant: 'destructive', title: messageOf(error) });
  const stopThread = useMutation(orpc.assistant.stopThread.mutationOptions({ onError }));

  const send = useMutation(orpc.assistant.send.mutationOptions());

  /** A new chat learns its thread from the reply to its first message, then watches it. */
  const sent = ({ threadId }: { threadId: string }) => {
    if (stopWanted.current) stopThread.mutate({ id: threadId });

    stopWanted.current = false;

    if (threadId !== tab.threadId) tabs.setThreadId(tab.key, threadId);
    else void watch.refetch({ cancelRefetch: false });
  };

  const busy = transcript.running || send.isPending;

  useRunEnded(transcript.running, () => {
    if (!open) setUnread(true);

    void client.invalidateQueries({ queryKey: orpc.assistant.thread.key() });
    void client.invalidateQueries({ queryKey: orpc.assistant.threads.key() });

    if (transcript.changed) {
      void client.invalidateQueries({
        predicate: (query) => !matchQuery({ queryKey: orpc.assistant.key() }, query),
      });
    }
  });

  const sendParts = (parts: AssistantMessagePart[]) =>
    send.mutate(sendRequest({ threadId: tab.threadId, parts, run: model.run }), {
      onSuccess: sent,
    });

  const sendMessage = (message: ComposerMessage) => sendParts(partsOf(message));

  const asked = useAtomValue(assistantAskState);
  const takeAsk = useSetAtom(takeAskAction);
  const blank = tab.threadId === null && transcript.messages.length === 0 && send.isIdle;

  const sendAsked = useEffectEvent((text: string) =>
    sendMessage({ text, mentions: [], page, files: [], selections: [] }),
  );

  /** A question asked from the top bar search is sent once, in a blank chat. */
  useEffect(() => {
    if (!asked || !blank) return;

    const text = takeAsk();

    if (text) sendAsked(text);
  }, [asked, blank, takeAsk]);

  const block: ComposerBlock = model.noKey ? 'no-key' : null;

  return {
    model,
    thread,
    watch,
    transcript,
    loaded: startedEmpty || watch.status !== 'pending',
    busy,
    block,
    send: sendMessage,
    sendError: send.error,
    retry: () => {
      if (send.variables) send.mutate(send.variables, { onSuccess: sent });
    },
    stop: () => {
      if (send.isPending) stopWanted.current = true;
      else if (tab.threadId) stopThread.mutate({ id: tab.threadId });
    },
    actions: {
      busy,
      onAction: (action: AssistantAction, label: string) =>
        sendParts([
          { type: 'text', text: label },
          { type: 'data-action', data: action },
        ]),
    },
  };
};
