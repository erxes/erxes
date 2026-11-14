import type { UIMessage } from 'ai';
import type { ModelRun } from './modelChoice';

interface ChatRequestInput {
  messages: UIMessage[];
  threadId?: string;
  run: Pick<ModelRun, 'provider' | 'model' | 'thinkingLevel'> | null;
  trigger?: 'submit-message' | 'regenerate-message';
  messageId?: string;
}

const replaces = (latest: UIMessage, { trigger, messageId }: ChatRequestInput) =>
  latest.role === 'user' && (trigger === 'regenerate-message' || messageId === latest.id);

export const chatRequestBody = (input: ChatRequestInput) => {
  const { messages, threadId, run } = input;
  const latest = messages.at(-1);

  if (!latest) throw new Error('A chat request carries a message');

  return {
    ...(threadId ? { threadId } : {}),
    message: { id: latest.id, role: latest.role, parts: latest.parts },
    ...(threadId && replaces(latest, input) ? { edit: true } : {}),
    ...(run ? { provider: run.provider } : {}),
    ...(run?.model ? { model: run.model } : {}),
    ...(run?.thinkingLevel ? { thinkingLevel: run.thinkingLevel } : {}),
  };
};
