import { debugError } from '@/integrations/discord/debuggers';

import {
  discordRequest,
  getErrorMessage,
} from '@/integrations/discord/utils/request';

import {
  TYPING_MAX_MS,
  TYPING_REFRESH_MS,
} from '@/integrations/discord/constants/typing';

const typingTimers = new Map<string, ReturnType<typeof setInterval>>();

export const sendTypingIndicator = (token: string, channelId: string) =>
  discordRequest<unknown>({
    token,
    method: 'POST',
    path: `/channels/${channelId}/typing`,
  }).catch((e) =>
    debugError(
      `Failed to send Discord typing indicator: ${getErrorMessage(e)}`,
    ),
  );

export const stopTypingIndicator = (channelId: string) => {
  const timer = typingTimers.get(channelId);
  if (timer) {
    clearInterval(timer);
    typingTimers.delete(channelId);
  }
};

export const startTypingIndicator = (
  token: string,
  channelId: string,
  maxMs: number = TYPING_MAX_MS,
) => {
  stopTypingIndicator(channelId);
  sendTypingIndicator(token, channelId).catch(() => undefined);

  const startedAt = Date.now();
  const timer = setInterval(() => {
    if (Date.now() - startedAt >= maxMs) {
      stopTypingIndicator(channelId);
      return;
    }
    sendTypingIndicator(token, channelId).catch(() => undefined);
  }, TYPING_REFRESH_MS);
  timer.unref?.();
  typingTimers.set(channelId, timer);
};
