import * as React from 'react';

import { IconChartBar } from '@tabler/icons-react';

import { Button } from 'erxes-ui/components/button';

import { serializeChartVizPayload } from '../utils/chatVizSanitize';
import type { ChartVizPayload } from '../types/chatVizTypes';

interface Props {
  /**
   * The chart data to send. `type` and `sentAt` are set automatically.
   *
   * Security: the payload is run through serializeChartVizPayload (sanitize
   * then JSON.stringify) before being handed to onSend. Never bypass this by
   * passing a pre-serialized string directly to onSend.
   */
  payload: Omit<ChartVizPayload, 'type' | 'sentAt'>;
  /** Receives the sanitized JSON string to embed in a chat message */
  onSend: (serialized: string) => void;
  disabled?: boolean;
  label?: string;
}

export function ChatVizSendButton({
  payload,
  onSend,
  disabled,
  label = 'Send chart',
}: Props) {
  const handleClick = () => {
    const serialized = serializeChartVizPayload(payload);
    if (serialized) onSend(serialized);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
    >
      <IconChartBar className="size-4 mr-1.5" aria-hidden />
      {label}
    </Button>
  );
}
