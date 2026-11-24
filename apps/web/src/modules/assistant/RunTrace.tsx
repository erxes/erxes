import { IconAlertTriangle } from '@tabler/icons-react';
import { Collapsible } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clock, LineTrigger, TraceList } from './Steps';
import { type ActivityRow, intentsOf, liveLabel } from './stepLabels';
import { ThinkingLine } from './ThinkingLine';
import type { Step } from './transcriptRows';

const useNow = (ticking: boolean) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ticking) return undefined;

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, [ticking]);

  return now;
};

const spoken = (ms: number, t: TFunction<'assistant'>) => {
  const seconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);

  if (!minutes) return t('duration.seconds', '{{seconds}}s', { seconds });

  return seconds % 60
    ? t('duration.minutes', '{{minutes}}m {{seconds}}s', { minutes, seconds: seconds % 60 })
    : t('duration.whole-minutes', '{{minutes}}m', { minutes });
};

const stoppedUnlessLive = (steps: Step[], live: boolean, stopped: string) =>
  live
    ? steps
    : steps.map((step) =>
        step.status === 'running' ? { ...step, status: 'failed' as const, error: stopped } : step,
      );

export const RunTrace = ({
  rows,
  live,
  startedAt,
  endedAt,
}: {
  rows: ActivityRow[];
  live: boolean;
  startedAt: number | null;
  endedAt: number | null;
}) => {
  const { t } = useTranslation('assistant');
  const now = useNow(live);
  const stopped = t('step.stopped', 'Stopped');

  const shown = rows.map((row) =>
    row.kind === 'steps' ? { ...row, steps: stoppedUnlessLive(row.steps, live, stopped) } : row,
  );

  const steps = shown.flatMap((row) => (row.kind === 'steps' ? row.steps : []));
  const failed = steps.filter((step) => step.status === 'failed').length;

  const listed =
    steps.length > 0 ||
    shown.some((row) => row.kind === 'thinking' && intentsOf(row.text).length > 0);

  if (live ? !rows.length : !listed) return null;

  const end = live ? now : endedAt;
  const elapsed = startedAt !== null && end !== null ? end - startedAt : null;

  return (
    <Collapsible className="flex flex-col">
      <LineTrigger className="w-auto self-start">
        {live ? (
          <>
            <ThinkingLine label={liveLabel(shown, t)} />
            {elapsed !== null && (
              <span className="shrink-0 font-mono text-muted-foreground/60 tabular-nums">
                {clock(elapsed)}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="shrink-0">
              {elapsed !== null
                ? t('worked', 'Worked for {{duration}}', { duration: spoken(elapsed, t) })
                : t('steps', {
                    count: steps.length,
                    defaultValue_one: '{{count}} step',
                    defaultValue_other: '{{count}} steps',
                  })}
            </span>
            {failed > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-destructive-text">
                <IconAlertTriangle aria-hidden className="size-3" />
                {failed}
              </span>
            )}
            <Collapsible.TriggerIcon className="size-2.5 shrink-0" />
          </>
        )}
      </LineTrigger>
      <Collapsible.Panel>
        <TraceList rows={shown} startedAt={startedAt} />
      </Collapsible.Panel>
    </Collapsible>
  );
};
