import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Label } from 'erxes-ui';
import { addHours, addMinutes, isAfter, isValid } from 'date-fns';
import { type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fromZonedInput, zoneLabel, zonedInputValue } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { useBroadcastHandlers } from './broadcastQueries';

/** The server takes a time at least a minute ahead. */
const isTooSoon = (date: Date) => !isAfter(date, addMinutes(Date.now(), 1));

/** The time picked on the organisation's clock, and sending it, at least a minute ahead. */
const useScheduleOnce = (
  broadcast: Broadcast,
  prepare: (() => Promise<void>) | undefined,
  onDone: () => void,
) => {
  const { timezone } = useSession().organization;
  const [at, setAt] = useState(() => zonedInputValue(addHours(Date.now(), 1), timezone));
  const [tooSoon, setTooSoon] = useState(false);
  const handlers = useBroadcastHandlers();

  const schedule = useMutation(
    orpc.broadcasts.schedule.mutationOptions({
      ...handlers,
      onSuccess: async () => {
        onDone();
        await handlers.onSuccess();
      },
    }),
  );

  const when = fromZonedInput(at, timezone);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const soon = isTooSoon(when);

    setTooSoon(soon);

    if (soon) return;

    await prepare?.();
    schedule.mutate({ id: broadcast.id, at: when.toISOString() });
  };

  return {
    at,
    setAt,
    tooSoon,
    timezone,
    canSubmit: isValid(when) && !schedule.isPending,
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void submit(event).catch(handlers.onError),
  };
};

/** Sends once, at a time the member picks on the organisation's clock. */
export const ScheduleOnce = ({
  broadcast,
  prepare,
  onDone,
}: {
  broadcast: Broadcast;
  prepare?: () => Promise<void>;
  onDone: () => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const id = useId();
  const once = useScheduleOnce(broadcast, prepare, onDone);

  return (
    <form onSubmit={once.onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={id}>{t('schedule-at', 'Send at')}</Label>
        <Input
          id={id}
          type="datetime-local"
          value={once.at}
          onChange={(event) => once.setAt(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {t(
            'schedule-hint',
            '{{zone}}, the organisation’s time zone. The audience is fixed when it starts.',
            { zone: zoneLabel(once.timezone) },
          )}
        </p>
        {once.tooSoon && (
          <p className="text-sm text-destructive-text">
            {t('schedule-too-soon', 'Pick a time at least a minute from now.')}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={!once.canSubmit}>
        {t('schedule-confirm', 'Schedule')}
      </Button>
    </form>
  );
};
