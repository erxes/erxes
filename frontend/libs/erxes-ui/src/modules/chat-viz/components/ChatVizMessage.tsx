import * as React from 'react';

import { cn } from 'erxes-ui/lib/utils';

import { sanitizeChartVizPayload } from '../utils/chatVizSanitize';
import { ChatVizArea } from './ChatVizArea';
import { ChatVizBar } from './ChatVizBar';
import { ChatVizLine } from './ChatVizLine';
import { ChatVizPie } from './ChatVizPie';
import type { ChartVizPayload } from '../types/chatVizTypes';

interface Props {
  /**
   * Raw parsed value from a chat message (e.g. JSON.parse of message.content).
   * Will be fully sanitized before any rendering occurs.
   *
   * XSS: all fields are validated/escaped inside sanitizeChartVizPayload.
   * SSR: chart components are client-only — a skeleton is shown until mount.
   * IDOR: this component renders only data embedded in the payload; it never
   *   fetches data by ID. Server-side authorization must gate what data may
   *   be embedded when the message is created.
   */
  rawPayload: unknown;
  className?: string;
}

export function ChatVizMessage({ rawPayload, className }: Props) {
  const payload = React.useMemo(
    () => sanitizeChartVizPayload(rawPayload),
    [rawPayload],
  );

  if (!payload) return null;

  return (
    <figure
      className={cn(
        'rounded-xl border bg-card p-4 shadow-sm space-y-2 max-w-lg w-full',
        className,
      )}
      aria-label={payload.title}
    >
      <figcaption className="space-y-0.5">
        <h4 className="font-semibold text-sm leading-tight">{payload.title}</h4>
        {payload.description && (
          <p className="text-muted-foreground text-xs">{payload.description}</p>
        )}
      </figcaption>
      <ChartRouter payload={payload} />
    </figure>
  );
}

function ChartRouter({ payload }: { payload: ChartVizPayload }) {
  switch (payload.chartType) {
    case 'bar':
      return <ChatVizBar payload={payload} />;
    case 'line':
      return <ChatVizLine payload={payload} />;
    case 'area':
      return <ChatVizArea payload={payload} />;
    case 'pie':
      return <ChatVizPie payload={payload} />;
    default:
      return null;
  }
}
