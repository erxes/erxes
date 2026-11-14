import { jsonOf } from 'erxes-ui';
import { z } from 'zod';

const ApiFailure = z.object({ code: z.string(), message: z.string() });

export interface ChatFailure {
  code: string | null;
  message: string;
}

export const chatFailureOf = (error: Error): ChatFailure => {
  const failure = jsonOf(ApiFailure).safeParse(error.message).data;

  return failure ?? { code: null, message: error.message };
};

export const needsKey = (failure: ChatFailure) =>
  failure.code === 'ASSISTANT_NO_CONNECTION' || failure.code === 'ASSISTANT_KEY_UNREADABLE';
