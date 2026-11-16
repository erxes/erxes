import { liveHub, type LiveSignal } from '~/modules/live/hub';

const running = new Map<string, AbortController>();

/** The signal that ends a thread's turn when the member stops it, here or on another server. */
export const trackTurn = (threadId: string) => {
  const controller = new AbortController();

  running.set(threadId, controller);

  return {
    signal: controller.signal,
    end: () => {
      if (running.get(threadId) === controller) running.delete(threadId);
    },
  };
};

export const stopTurn = (threadId: string) => running.get(threadId)?.abort();

liveHub.on('signal', (signal: LiveSignal) => {
  if (signal.k === 'assistant-stop') stopTurn(signal.t);
});
