import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconCalendarClock } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Label, Popover } from 'erxes-ui';
import { addHours, addMinutes, format, isAfter, isValid, parseISO } from 'date-fns';
import { type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBroadcastHandlers } from './broadcastQueries';

/** A `datetime-local` value: the browser's local time, to the minute. */
const localValue = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

/** The server takes a time at least a minute ahead. */
const isTooSoon = (date: Date) => !isAfter(date, addMinutes(Date.now(), 1));

/** Sends at a time the member picks, at least a minute ahead. */
export const ScheduleButton = ({
  broadcast,
  prepare,
  disabled,
}: {
  broadcast: Broadcast;
  prepare?: () => Promise<void>;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('broadcasts');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(() => localValue(addHours(Date.now(), 1)));
  const handlers = useBroadcastHandlers();

  const schedule = useMutation(
    orpc.broadcasts.schedule.mutationOptions({
      ...handlers,
      onSuccess: async () => {
        setOpen(false);
        await handlers.onSuccess();
      },
    }),
  );

  const [tooSoon, setTooSoon] = useState(false);
  const when = parseISO(at);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const soon = isTooSoon(when);

    setTooSoon(soon);

    if (soon) return;

    await prepare?.();
    schedule.mutate({ id: broadcast.id, at: when.toISOString() });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="outline" disabled={disabled} />}>
        <IconCalendarClock />
        {t('schedule', 'Schedule')}
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72">
        <form
          onSubmit={(event) => void submit(event).catch(handlers.onError)}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor={id}>{t('schedule-at', 'Send at')}</Label>
            <Input
              id={id}
              type="datetime-local"
              value={at}
              onChange={(event) => setAt(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('schedule-hint', 'Your time zone. The audience is fixed when it starts.')}
            </p>
            {tooSoon && (
              <p className="text-sm text-destructive">
                {t('schedule-too-soon', 'Pick a time at least a minute from now.')}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!isValid(when) || schedule.isPending}>
            {t('schedule-confirm', 'Schedule')}
          </Button>
        </form>
      </Popover.Content>
    </Popover>
  );
};
