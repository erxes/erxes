import type { UIMessage } from 'ai';
import type { ModelRun } from './modelChoice';

interface ChatRequestInput {
  messages: UIMessage[];
  threadId?: string;
  run: Pick<ModelRun, 'provider' | 'model' | 'thinkingLevel'> | null;
}

export const chatRequestBody = ({ messages, threadId, run }: ChatRequestInput) => {
  const latest = messages.at(-1);

  if (!latest) throw new Error('A chat request carries a message');

  return {
    ...(threadId ? { threadId } : {}),
    message: { id: latest.id, role: latest.role, parts: latest.parts },
    ...(run ? { provider: run.provider } : {}),
    ...(run?.model ? { model: run.model } : {}),
    ...(run?.thinkingLevel ? { thinkingLevel: run.thinkingLevel } : {}),
  };
};
