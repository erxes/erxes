import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastHandlers } from '../broadcastQueries';
import { ScheduleButton } from '../ScheduleButton';

/** Pause, resume and stop a recurring broadcast's schedule; stopping asks first. */
const useRepeatMoves = (broadcast: Broadcast) => {
  const { t } = useTranslation('broadcasts');
  const { confirm } = useConfirm();
  const handlers = useBroadcastHandlers();

  const schedule = useQuery(
    orpc.broadcastSchedules.get.queryOptions({ input: { id: broadcast.id } }),
  );

  const pause = useMutation(orpc.broadcastSchedules.pause.mutationOptions(handlers));
  const resume = useMutation(orpc.broadcastSchedules.resume.mutationOptions(handlers));
  const stop = useMutation(orpc.broadcastSchedules.stop.mutationOptions(handlers));
  const input = { id: broadcast.id };

  return {
    state: schedule.data?.state,
    pause: () => pause.mutate(input),
    resume: () => resume.mutate(input),
    stop: () =>
      void confirm({
        message: t('repeat.stop-confirm', 'Stop repeating “{{name}}”?', { name: broadcast.name }),
        options: {
          description: t(
            'repeat.stop-description',
            'No more runs are made. Runs already sent keep their numbers.',
          ),
          okLabel: t('repeat.stop', 'Stop repeating'),
          variants: { ok: 'destructive' },
        },
      }).then(() => stop.mutate(input)),
  };
};

/** A recurring broadcast's header actions, by where its schedule stands. */
export const RepeatActions = ({
  broadcast,
  prepare,
}: {
  broadcast: Broadcast;
  prepare?: () => Promise<void>;
}) => {
  const { t } = useTranslation('broadcasts');
  const moves = useRepeatMoves(broadcast);
  const running = moves.state === 'active' || moves.state === 'paused';

  return (
    <>
      {running && <ScheduleButton broadcast={broadcast} prepare={prepare} />}
      {moves.state === 'active' && (
        <Button variant="outline" onClick={moves.pause}>
          <IconPlayerPause />
          {t('repeat.pause', 'Pause')}
        </Button>
      )}
      {moves.state === 'paused' && (
        <Button onClick={moves.resume}>
          <IconPlayerPlay />
          {t('repeat.resume', 'Resume')}
        </Button>
      )}
      {running && (
        <Button variant="ghost" onClick={moves.stop}>
          <IconPlayerStop />
          {t('repeat.stop', 'Stop repeating')}
        </Button>
      )}
    </>
  );
};
