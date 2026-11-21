import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import {
  IconCopy,
  IconDots,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, DropdownMenu, useConfirm, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { isRemovable, useBroadcastHandlers, useDuplicateBroadcast } from './broadcastQueries';
import { RepeatActions } from './repeat/RepeatActions';
import { ScheduleButton } from './ScheduleButton';

/**
 * The status moves, with sending and stopping behind a confirmation. `broadcast` carries the
 * editor's audience, which `prepare` saves before the count is asked for.
 */
const useMoves = (broadcast: Broadcast, prepare?: () => Promise<void>) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const { confirm } = useConfirm();
  const handlers = useBroadcastHandlers();
  const { id, name } = broadcast;

  const move = {
    send: useMutation(orpc.broadcasts.send.mutationOptions(handlers)),
    unschedule: useMutation(orpc.broadcasts.unschedule.mutationOptions(handlers)),
    pause: useMutation(orpc.broadcasts.pause.mutationOptions(handlers)),
    resume: useMutation(orpc.broadcasts.resume.mutationOptions(handlers)),
    cancel: useMutation(orpc.broadcasts.cancel.mutationOptions(handlers)),
  };

  const sendNow = async () => {
    await prepare?.();

    const { reachable } = await orpc.broadcasts.audience.call({
      channel: broadcast.channel,
      viewId: broadcast.viewId,
      filter: broadcast.filter,
    });

    await confirm({
      message: t('send-confirm', 'Send “{{name}}” now?', { name }),
      options: {
        description: t('send-description', 'It goes to {{formatted}} people and can’t be unsent.', {
          count: reachable,
          formatted: fmt.number(reachable),
        }),
        okLabel: t('send-now', 'Send now'),
      },
    });
    move.send.mutate({ id });
  };

  const stop = () =>
    void confirm({
      message: t('cancel-confirm', 'Stop “{{name}}” for good?', { name }),
      options: {
        description: t('cancel-description', 'Those not sent to yet are skipped.'),
        okLabel: t('cancel', 'Stop for good'),
        variants: { ok: 'destructive' },
      },
    }).then(() => move.cancel.mutate({ id }));

  return { move, sendNow, stop };
};

/** Duplicate (after `prepare` saves the editor's changes) and delete, behind the "more" button. */
const MoreMenu = ({
  broadcast,
  prepare,
}: {
  broadcast: Broadcast;
  prepare?: () => Promise<void>;
}) => {
  const { t } = useTranslation('broadcasts');
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const handlers = useBroadcastHandlers();
  const { duplicate, pending } = useDuplicateBroadcast();

  const remove = useMutation(
    orpc.broadcasts.remove.mutationOptions({
      ...handlers,
      onSuccess: () => navigate(paths.broadcasts.list),
    }),
  );

  const removable = isRemovable(broadcast.status);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={<Button variant="outline" size="icon" aria-label={t('more', 'More')} />}
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item disabled={pending} onClick={() => duplicate(broadcast.id, prepare)}>
          <IconCopy />
          {t('duplicate', 'Duplicate')}
        </DropdownMenu.Item>
        {removable && (
          <DropdownMenu.Item
            variant="destructive"
            onClick={() =>
              void confirm({
                message: t('remove-confirm', 'Delete “{{name}}”?', { name: broadcast.name }),
                options: {
                  description: t(
                    'remove-description',
                    'Its recipients and numbers go too. Suppressed addresses stay suppressed.',
                  ),
                  okLabel: t('remove', 'Delete'),
                  variants: { ok: 'destructive' },
                },
              }).then(() => remove.mutate({ id: broadcast.id }))
            }
          >
            <IconTrash />
            {t('remove', 'Delete')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/**
 * What can happen to the broadcast next, by its status. `prepare` saves the editor's changes
 * first; `blocked` says why it can't go yet.
 */
export const BroadcastActions = ({
  broadcast,
  prepare,
  blocked,
}: {
  broadcast: Broadcast;
  prepare?: () => Promise<void>;
  blocked?: string | null;
}) => {
  const { t } = useTranslation('broadcasts');
  const can = useCan();
  const fmt = useFormat();
  const { onError } = useBroadcastHandlers();
  const { move, sendNow, stop } = useMoves(broadcast, prepare);
  const { id, status } = broadcast;
  const canSend = can('broadcasts.send');

  return (
    <>
      {canSend && status === 'scheduled' && (
        <>
          <span className="text-sm text-muted-foreground">
            {broadcast.scheduledAt &&
              t('goes-at', 'Goes {{when}}', { when: fmt.dateTime(broadcast.scheduledAt) })}
          </span>
          <Button variant="outline" onClick={() => move.unschedule.mutate({ id })}>
            {t('unschedule', 'Unschedule')}
          </Button>
        </>
      )}
      {canSend && status === 'draft' && (
        <ScheduleButton broadcast={broadcast} prepare={prepare} disabled={Boolean(blocked)} />
      )}
      {canSend && status === 'recurring' && (
        <RepeatActions broadcast={broadcast} prepare={prepare} />
      )}
      {canSend && (status === 'draft' || status === 'scheduled') && (
        <Button
          disabled={Boolean(blocked) || move.send.isPending}
          title={blocked ?? undefined}
          onClick={() => void sendNow().catch(onError)}
        >
          <IconSend />
          {t('send-now', 'Send now')}
        </Button>
      )}
      {canSend && status === 'sending' && (
        <Button variant="outline" onClick={() => move.pause.mutate({ id })}>
          <IconPlayerPause />
          {t('pause', 'Pause')}
        </Button>
      )}
      {canSend && status === 'paused' && (
        <Button onClick={() => move.resume.mutate({ id })}>
          <IconPlayerPlay />
          {t('resume', 'Resume')}
        </Button>
      )}
      {canSend && (status === 'sending' || status === 'paused' || status === 'scheduled') && (
        <Button variant="ghost" onClick={stop}>
          <IconPlayerStop />
          {t('cancel', 'Stop for good')}
        </Button>
      )}
      {can('broadcasts.manage') && <MoreMenu broadcast={broadcast} prepare={prepare} />}
    </>
  );
};
