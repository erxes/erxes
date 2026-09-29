import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import {
  isRecurringForm,
  isScheduleReady,
  TBroadcastScheduleForm,
} from '../../utils/scheduleForm';
import {
  BroadcastScheduleFields,
  emptySchedule,
} from './BroadcastScheduleFields';
import { useTranslation } from 'react-i18next';

type TBroadcastScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TBroadcastScheduleForm;
  onConfirm: (schedule: TBroadcastScheduleForm) => void;
  loading?: boolean;
};

/**
 * Sets the schedule of a campaign that already exists.
 *
 * A dialog rather than a popover because it is opened from inside the actions
 * menu, which is a popover itself. It carries no knowledge of how the campaign
 * is saved: it hands back one schedule and lets the caller apply it.
 */
export const BroadcastScheduleDialog = ({
  open,
  onOpenChange,
  ...props
}: TBroadcastScheduleDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <Dialog.Content className="sm:max-w-md">
      <BroadcastScheduleDialogBody onOpenChange={onOpenChange} {...props} />
    </Dialog.Content>
  </Dialog>
);

/**
 * Mounted each time the dialog opens, so it starts from what the campaign
 * says now. Holding the pick up here instead meant any re-render of the
 * campaign behind it threw away what was being picked.
 */
const BroadcastScheduleDialogBody = ({
  onOpenChange,
  initial,
  onConfirm,
  loading,
}: Omit<TBroadcastScheduleDialogProps, 'open'>) => {
  const { t } = useTranslation('broadcasts');
  const [schedule, setSchedule] = useState<TBroadcastScheduleForm>(
    () => initial ?? emptySchedule(),
  );

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>{t('schedule.dialog-title')}</Dialog.Title>
        <Dialog.Description>{t('schedule.dialog-body')}</Dialog.Description>
      </Dialog.Header>

      <div className="px-6">
        <BroadcastScheduleFields value={schedule} onChange={setSchedule} />
      </div>

      <Dialog.Footer>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {t('steps.cancel')}
        </Button>
        <Button
          disabled={!isScheduleReady(schedule) || loading}
          onClick={() => onConfirm(schedule)}
        >
          {t(
            isRecurringForm(schedule)
              ? 'schedule.start-repeating'
              : 'schedule.confirm',
          )}
        </Button>
      </Dialog.Footer>
    </>
  );
};
