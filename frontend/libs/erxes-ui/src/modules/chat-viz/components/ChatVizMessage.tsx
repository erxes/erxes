import * as React from 'react';

import { Slider } from 'erxes-ui/components/slider';
import { cn } from 'erxes-ui/lib/utils';

import {
  applyChartVizTransforms,
  getChartVizInteractiveDomain,
  getDefaultChartVizControlValues,
  type ChartVizControlValues,
} from '../utils/chartVizTransforms';
import { sanitizeChartVizPayload } from '../utils/chatVizSanitize';
import { ChatVizArea } from './ChatVizArea';
import { ChatVizBar } from './ChatVizBar';
import { ChatVizLine } from './ChatVizLine';
import { ChatVizPie } from './ChatVizPie';
import type {
  ChartVizPayload,
  ChartVizSliderControl,
} from '../types/chatVizTypes';

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

  return <SanitizedChatVizMessage payload={payload} className={className} />;
}

function SanitizedChatVizMessage({
  payload,
  className,
}: {
  payload: ChartVizPayload;
  className?: string;
}) {
  const defaultValues = React.useMemo(
    () => getDefaultChartVizControlValues(payload),
    [payload],
  );
  const [controlValues, setControlValues] =
    React.useState<ChartVizControlValues>(defaultValues);

  React.useEffect(() => {
    setControlValues(defaultValues);
  }, [defaultValues]);

  const renderedPayload = React.useMemo(
    () => applyChartVizTransforms(payload, controlValues),
    [controlValues, payload],
  );

  // One axis domain covering every control extreme, computed from the
  // BASELINE payload. Freezing this while sliders move makes the chart
  // geometry visibly move; scaling per render would only relabel the ticks.
  const interactiveDomain = React.useMemo(
    () => getChartVizInteractiveDomain(payload),
    [payload],
  );
  const interactiveBarDomain = React.useMemo(
    () => getChartVizInteractiveDomain(payload, { includeZero: true }),
    [payload],
  );

  return (
    <figure
      className={cn(
        'rounded-xl border bg-card p-4 shadow-sm space-y-3 max-w-lg w-full',
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
      {!!payload.controls?.length && (
        <ChartVizControls
          controls={payload.controls}
          values={controlValues}
          onChange={(key, value) =>
            setControlValues((current) => ({ ...current, [key]: value }))
          }
        />
      )}
      <ChartRouter
        payload={renderedPayload}
        domain={interactiveDomain}
        barDomain={interactiveBarDomain}
      />
    </figure>
  );
}

const VALUE_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
});

function ChartVizControls({
  controls,
  values,
  onChange,
}: {
  controls: ChartVizSliderControl[];
  values: ChartVizControlValues;
  onChange: (key: string, value: number) => void;
}) {
  return (
    <div
      className="space-y-3 rounded-lg border bg-muted/30 p-3"
      aria-label="What-if controls"
    >
      {controls.map((control) => {
        const value = values[control.key] ?? control.defaultValue;

        return (
          <div key={control.key} className="space-y-2">
            <div className="flex items-start justify-between gap-3 text-xs">
              <div>
                <p className="font-medium text-foreground">{control.label}</p>
                {control.description && (
                  <p className="mt-0.5 text-muted-foreground">
                    {control.description}
                  </p>
                )}
              </div>
              <output
                className="shrink-0 rounded-md border bg-background px-2 py-0.5 font-mono font-medium tabular-nums"
                aria-live="polite"
              >
                {control.valuePrefix}
                {VALUE_FORMATTER.format(value)}
                {control.valueSuffix}
              </output>
            </div>
            <Slider
              value={[value]}
              min={control.min}
              max={control.max}
              step={control.step}
              aria-label={control.label}
              onValueChange={([nextValue]) => {
                if (nextValue !== undefined) onChange(control.key, nextValue);
              }}
            />
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>
                {control.valuePrefix}
                {VALUE_FORMATTER.format(control.min)}
                {control.valueSuffix}
              </span>
              <span>
                {control.valuePrefix}
                {VALUE_FORMATTER.format(control.max)}
                {control.valueSuffix}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartRouter({
  payload,
  domain,
  barDomain,
}: {
  payload: ChartVizPayload;
  domain?: [number, number];
  barDomain?: [number, number];
}) {
  switch (payload.chartType) {
    case 'bar':
      return <ChatVizBar payload={payload} domain={barDomain} />;
    case 'line':
      return <ChatVizLine payload={payload} domain={domain} />;
    case 'area':
      return <ChatVizArea payload={payload} domain={domain} />;
    case 'pie':
      return <ChatVizPie payload={payload} />;
    default:
      return null;
  }
}
