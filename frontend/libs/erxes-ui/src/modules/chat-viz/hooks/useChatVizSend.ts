import { useCallback } from 'react';
import { serializeChartVizPayload } from '../utils/chatVizSanitize';
import type { ChartVizPayload } from '../types/chatVizTypes';

type SendFn = (serialized: string) => void | Promise<void>;

/**
 * Returns a stable callback that sanitizes + serializes a chart payload and
 * hands the resulting JSON string to `onSend` (e.g. a chat mutation).
 *
 * Security: always go through serializeChartVizPayload — callers must not
 * bypass this by pre-serializing the payload themselves.
 */
export function useChatVizSend(onSend: SendFn) {
  return useCallback(
    (payload: Omit<ChartVizPayload, 'type' | 'sentAt'>) => {
      const serialized = serializeChartVizPayload(payload);
      if (serialized) return onSend(serialized);
    },
    [onSend],
  );
}
