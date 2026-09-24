import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IBroadcastMethodEnum } from '../types';
import {
  prepareBroadcastVariables,
  TBroadcastAction,
} from '../utils/prepareBroadcastVariables';
import { TBroadcastScheduleForm } from '../utils/scheduleForm';
import { useBroadcastAdd } from './useBroadcastAdd';
import { useBroadcastEdit } from './useBroadcastEdit';
import { IBroadcastFormData } from './useBroadcastForm';
import { useBroadcastSchedule } from './useBroadcastSchedule';

/**
 * Saves a campaign, new or edited, and schedules it when asked to. Resolves
 * whether it was saved, so the sheet closes only then.
 */
export const useBroadcastSubmit = ({
  messageId,
  method,
}: {
  messageId?: string;
  method?: IBroadcastMethodEnum | null;
}) => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const { addBroadcast } = useBroadcastAdd();
  const { editBroadcast } = useBroadcastEdit();
  const { setSchedule } = useBroadcastSchedule();

  const fail = (titleKey: string) => (error: Error) =>
    toast({
      variant: 'destructive',
      title: t(titleKey),
      description: error.message,
    });

  // A moment can only be set on a campaign that exists, so scheduling happens
  // after the save rather than as part of it. A campaign saved but not
  // scheduled stays a draft, which is the recoverable half of the pair.
  const scheduleSaved = (_id: string, schedule: TBroadcastScheduleForm) =>
    setSchedule(_id, schedule, {
      onError: fail('toast.schedule-failed'),
      onCompleted: () =>
        toast({ variant: 'default', title: t('toast.scheduled') }),
    });

  const announce = (action?: TBroadcastAction) =>
    toast({
      variant: 'default',
      title: t(
        messageId
          ? 'toast.saved'
          : action === 'draft'
          ? 'toast.saved-draft'
          : 'toast.created',
      ),
    });

  const submit = async (
    data: IBroadcastFormData,
    action?: TBroadcastAction,
  ): Promise<boolean> => {
    if (!method) {
      return false;
    }

    const schedule = action === 'schedule' ? data.schedule : undefined;
    const onError = fail('toast.save-failed');

    const variables = await prepareBroadcastVariables(
      data,
      method,
      action,
    ).catch(onError);

    if (!variables) {
      return false;
    }

    let saved = false;

    const onSaved = (_id?: string) => {
      saved = true;

      if (schedule && _id) {
        scheduleSaved(_id, schedule);
        return;
      }

      announce(action);
    };

    if (messageId) {
      await editBroadcast({
        variables: { _id: messageId, ...variables },
        onError,
        onCompleted: () => onSaved(messageId),
      });

      return saved;
    }

    await addBroadcast({
      variables,
      onError,
      onCompleted: (created: { engageMessageAdd?: { _id: string } }) =>
        onSaved(created?.engageMessageAdd?._id),
    });

    return saved;
  };

  return { submit };
};
