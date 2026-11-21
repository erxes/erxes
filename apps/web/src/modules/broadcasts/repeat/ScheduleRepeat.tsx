import type { Broadcast, BroadcastSchedule } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'erxes-ui';
import type { SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useBroadcastHandlers } from '../broadcastQueries';
import { RepeatFields } from './RepeatFields';
import { useRepeatForm } from './useRepeatForm';

/**
 * Starts a draft repeating (after `prepare` saves the editor), or changes a recurring one's rule.
 * Each run sends a copy of the broadcast as it is then.
 */
const useRepeatSubmit = (
  broadcast: Broadcast,
  schedule: BroadcastSchedule | null,
  prepare: (() => Promise<void>) | undefined,
  onDone: () => void,
) => {
  const form = useRepeatForm(schedule);
  const handlers = useBroadcastHandlers();

  const options = {
    ...handlers,
    onSuccess: async () => {
      onDone();
      await handlers.onSuccess();
    },
  };

  const start = useMutation(orpc.broadcastSchedules.start.mutationOptions(options));
  const save = useMutation(orpc.broadcastSchedules.save.mutationOptions(options));
  const recurring = broadcast.status === 'recurring';

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (recurring) {
      save.mutate({ id: broadcast.id, ...form.rule });

      return;
    }

    await prepare?.();
    start.mutate({ id: broadcast.id, ...form.rule });
  };

  return {
    form,
    recurring,
    canSubmit: form.complete && !start.isPending && !save.isPending,
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void submit(event).catch(handlers.onError),
  };
};

/** The repeat fields and their next runs, then start (or save) the schedule. */
export const ScheduleRepeat = ({
  broadcast,
  schedule,
  prepare,
  onDone,
}: {
  broadcast: Broadcast;
  schedule: BroadcastSchedule | null;
  prepare?: () => Promise<void>;
  onDone: () => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const repeat = useRepeatSubmit(broadcast, schedule, prepare, onDone);

  return (
    <form onSubmit={repeat.onSubmit} className="space-y-3">
      <RepeatFields form={repeat.form} />
      <p className="text-xs text-muted-foreground">
        {repeat.recurring
          ? t('repeat.save-hint', 'Runs already sent stay as they are.')
          : t(
              'repeat.start-hint',
              'Each run sends a copy of this broadcast as it is then, to the audience as it is then.',
            )}
      </p>
      <Button type="submit" className="w-full" disabled={!repeat.canSubmit}>
        {repeat.recurring
          ? t('repeat.save', 'Save schedule')
          : t('repeat.start', 'Start repeating')}
      </Button>
    </form>
  );
};
