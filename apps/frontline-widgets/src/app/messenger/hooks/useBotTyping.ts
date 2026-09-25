import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { isBotTypingAtom } from '../states';

/**
 * Safety net for a bot reply that never arrives — an automation that matches no
 * trigger condition, or one that fails before it can publish `typing: false`.
 * The backend re-publishes `typing: true` when the agent starts working, which
 * restarts this timer, so it only has to outlast a single agent step.
 */
const BOT_TYPING_TIMEOUT = 60_000;

let timeoutId: ReturnType<typeof setTimeout> | null = null;

const clearBotTypingTimeout = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

export const useBotTyping = () => {
  const [isBotTyping, setIsBotTyping] = useAtom(isBotTypingAtom);

  const stopBotTyping = useCallback(() => {
    clearBotTypingTimeout();
    setIsBotTyping(false);
  }, [setIsBotTyping]);

  const startBotTyping = useCallback(() => {
    clearBotTypingTimeout();
    setIsBotTyping(true);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      setIsBotTyping(false);
    }, BOT_TYPING_TIMEOUT);
  }, [setIsBotTyping]);

  return { isBotTyping, startBotTyping, stopBotTyping };
};
