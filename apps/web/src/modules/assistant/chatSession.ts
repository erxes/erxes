import { Chat } from '@ai-sdk/react';
import { CORE_API_PREFIX } from '@erxes/core-contract';
import { type ChatTransport, DefaultChatTransport, type UIMessage, type UIMessageChunk } from 'ai';
import { z } from 'zod';
import type { AssistantTab } from './assistantState';
import { chatRequestBody } from './chatRequest';
import type { ModelRun } from './modelChoice';
import { pendingAction } from './transcriptRows';

const StartMetadata = z.object({ threadId: z.string() });

type ThreadIdListener = (tabKey: string, threadId: string) => void;

export class ChatSession {
  threadId: string | null;
  run: ModelRun | null = null;
  readonly chat: Chat<UIMessage>;

  constructor(
    readonly tabKey: string,
    threadId: string | null,
    private readonly onThreadId: ThreadIdListener,
  ) {
    this.threadId = threadId;
    this.chat = new Chat<UIMessage>({ id: tabKey, transport: this.transport() });
  }

  private watchThreadId() {
    return new TransformStream<UIMessageChunk, UIMessageChunk>({
      transform: (chunk, controller) => {
        if (chunk.type === 'start') {
          const threadId = StartMetadata.safeParse(chunk.messageMetadata).data?.threadId;

          if (threadId && threadId !== this.threadId) {
            this.threadId = threadId;
            this.onThreadId(this.tabKey, threadId);
          }
        }

        controller.enqueue(chunk);
      },
    });
  }

  private transport(): ChatTransport<UIMessage> {
    const http = new DefaultChatTransport<UIMessage>({
      api: `${CORE_API_PREFIX}/assistant/chat`,
      credentials: 'same-origin',
      prepareSendMessagesRequest: ({ messages, trigger, messageId }) => ({
        body: chatRequestBody({
          messages,
          threadId: this.threadId ?? undefined,
          run: this.run,
          trigger,
          messageId,
        }),
      }),
    });

    return {
      sendMessages: async (options) =>
        (await http.sendMessages(options)).pipeThrough(this.watchThreadId()),
      reconnectToStream: () => Promise.resolve(null),
    };
  }

  chooseModel(run: ModelRun | null) {
    this.run = run;
  }

  showStored(messages: UIMessage[]) {
    if (messages.length >= this.chat.messages.length) this.chat.messages = messages;
  }

  private async continueWhenAnswered() {
    if (pendingAction(this.chat.lastMessage) === null) await this.chat.sendMessage();
  }

  async respond(approvalId: string, approved: boolean) {
    await this.chat.addToolApprovalResponse({ id: approvalId, approved });
    await this.continueWhenAnswered();
  }

  async answer(toolCallId: string, answers: (string | string[])[]) {
    await this.chat.addToolOutput({ tool: 'ask_user', toolCallId, output: { answers } });
    await this.continueWhenAnswered();
  }
}

const sessions = new Map<string, ChatSession>();

export const sessionFor = (tab: AssistantTab, onThreadId: ThreadIdListener) => {
  const existing = sessions.get(tab.key);

  if (existing) return existing;

  const session = new ChatSession(tab.key, tab.threadId, onThreadId);

  sessions.set(tab.key, session);

  return session;
};

export const dropSession = (tabKey: string) => {
  void sessions.get(tabKey)?.chat.stop();
  sessions.delete(tabKey);
};
