import { useBroadcastCancelSchedule } from '@/broadcast/hooks/useBroadcastCancelSchedule';
import { useBroadcastCopy } from '@/broadcast/hooks/useBroadcastCopy';
import { useBroadcastLive } from '@/broadcast/hooks/useBroadcastLive';
import { useBroadcastPause } from '@/broadcast/hooks/useBroadcastPause';
import { useBroadcastSchedule } from '@/broadcast/hooks/useBroadcastSchedule';
import { IBroadcastMethodEnum } from '@/broadcast/types';
import { ApolloError } from '@apollo/client';
import { useConfirm, useMultiQueryState, useToast } from 'erxes-ui';
import { useState } from 'react';
import { BROADCAST_CONFIRM_MESSAGES } from '../constants';
import { campaignActions, TCampaignLockState } from '../utils/campaignActions';
import { TCampaignSchedule } from '../utils/campaignSchedule';
import { scheduleToForm, TBroadcastScheduleForm } from '../utils/scheduleForm';
import { useTranslation } from 'react-i18next';

export type TBroadcastCampaign = TCampaignSchedule & {
  _id: string;
  method?: IBroadcastMethodEnum;
  isLive?: boolean;
  approvalLockState?: TCampaignLockState;
};

type TBroadcastActionQueryParams = {
  messageId: string;
  editMessageId: string;
  method: IBroadcastMethodEnum;
};

/**
 * Everything that can be done to one campaign, already wired.
 *
 * The same campaign is acted on from the table, the grid, the detail sheet and
 * the command bar. Each of those used to carry its own copy of the confirm
 * text, the mutation call and the toast, which is how they drifted: one said
 * "Succesfully set live" while the next said "The broadcast is running", and
 * adding Duplicate meant editing four files.
 *
 * Callers get ready handlers and the flags saying which of them to offer, so a
 * component decides where a button goes and nothing else.
 *
 * @param onDone runs after an action succeeds — the command bar clears its row
 * selection with it, since the rows it was acting on are no longer what they
 * were.
 */
export const useBroadcastCampaignActions = (
  campaign?: TBroadcastCampaign | null,
  { onDone }: { onDone?: () => void } = {},
) => {
  const { t } = useTranslation('broadcasts');
  const [, setQueryParams] = useMultiQueryState<TBroadcastActionQueryParams>([
    'messageId',
    'editMessageId',
    'method',
  ]);
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const { setBroadcastLive } = useBroadcastLive();
  const { pauseBroadcast } = useBroadcastPause();
  const { copyBroadcast } = useBroadcastCopy();
  const { cancelSchedule } = useBroadcastCancelSchedule();
  const { setSchedule, loading: scheduling } = useBroadcastSchedule();

  const [scheduleOpen, setScheduleOpen] = useState(false);

  const actions = campaignActions(campaign);
  const { canResume, scheduled } = actions;

  const _id = campaign?._id as string;

  const onError = (error: ApolloError) =>
    toast({
      title: t('toast.error'),
      description: error.message,
      variant: 'destructive',
    });

  const succeed = (title: string, description: string) => () => {
    toast({ title, description, variant: 'success' });
    onDone?.();
  };

  // The method is what holds the creation sheet open, so a campaign left
  // half-edited must not leave it behind on the way to the detail view.
  const preview = () =>
    setQueryParams({ messageId: _id, editMessageId: null, method: null });

  const edit = () =>
    setQueryParams({
      messageId: null,
      editMessageId: _id,
      method: campaign?.method,
    });

  // Opens the copy straight away: it is a draft nobody has seen, and leaving
  // it to be hunted for in the list is the slower half of duplicating.
  const duplicate = () =>
    copyBroadcast(_id, {
      onError,
      onCompleted: (data: {
        engageMessageCopy?: { _id: string; method: IBroadcastMethodEnum };
      }) => {
        const copy = data?.engageMessageCopy;

        toast({
          title: t('toast.duplicated'),
          variant: 'success',
          description: t('toast.duplicated-body'),
        });

        onDone?.();

        if (copy) {
          setQueryParams({
            messageId: null,
            editMessageId: copy._id,
            method: copy.method,
          });
        }
      },
    });

  // Resuming, sending ahead of a schedule and a first send are one mutation
  // but three different promises, so the wording follows the state.
  const goLiveMessage = canResume
    ? BROADCAST_CONFIRM_MESSAGES.resume
    : scheduled
    ? BROADCAST_CONFIRM_MESSAGES.sendNow
    : BROADCAST_CONFIRM_MESSAGES.goLive;

  const goLive = () =>
    confirm({ message: goLiveMessage }).then(() =>
      setBroadcastLive(_id, {
        onError,
        onCompleted: succeed('Live', 'The broadcast is running'),
      }),
    );

  const pause = () =>
    confirm({ message: BROADCAST_CONFIRM_MESSAGES.pause }).then(() =>
      pauseBroadcast(_id, {
        onError,
        onCompleted: succeed(
          'Paused',
          'The broadcast stopped taking new recipients',
        ),
      }),
    );

  const cancelScheduleAction = () =>
    confirm({ message: BROADCAST_CONFIRM_MESSAGES.cancelSchedule }).then(() =>
      cancelSchedule(_id, {
        onError,
        onCompleted: succeed(
          'Schedule cancelled',
          'The broadcast is a draft again',
        ),
      }),
    );

  // Scheduling asks for a moment first, so the action opens the picker and the
  // mutation waits for what comes back from it.
  const schedule = () => setScheduleOpen(true);

  const scheduleDialog = {
    open: scheduleOpen,
    onOpenChange: setScheduleOpen,
    initial: scheduleToForm(campaign?.scheduleDate),
    loading: scheduling,
    onConfirm: (schedule: TBroadcastScheduleForm) =>
      setSchedule(_id, schedule, {
        // The schedule itself is checked before the button enables, so a
        // refusal is about the campaign, not the moment. Leaving the dialog
        // open would only invite picking the same moment again.
        onError: (error: ApolloError) => {
          setScheduleOpen(false);
          onError(error);
        },
        onCompleted: () => {
          setScheduleOpen(false);
          succeed('Scheduled', 'The broadcast goes out on its own')();
        },
      }),
  };

  return {
    ...actions,
    // One send button in three states, named once so the table and the sheet
    // cannot label the same action differently.
    goLiveLabel: canResume ? 'Resume' : scheduled ? 'Send now' : 'Live',
    preview,
    edit,
    duplicate,
    goLive,
    pause,
    schedule,
    scheduleDialog,
    cancelSchedule: cancelScheduleAction,
  };
};
