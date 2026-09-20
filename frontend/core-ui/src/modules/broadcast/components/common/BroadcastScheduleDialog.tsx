import { Button, Dialog } from 'erxes-ui';
import { useEffect, useState } from 'react';
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
  initial,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TBroadcastScheduleForm;
  onConfirm: (schedule: TBroadcastScheduleForm) => void;
  loading?: boolean;
}) => {
  const { t } = useTranslation('broadcasts');
  const [schedule, setSchedule] = useState<TBroadcastScheduleForm>(
    initial ?? emptySchedule(),
  );

  // Reopening starts from what the campaign says now, not from what was picked
  // and abandoned last time.
  useEffect(() => {
    if (open) {
      setSchedule(initial ?? emptySchedule());
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('schedule.dialog-title')}</Dialog.Title>
          <Dialog.Description>
            It goes out on its own, and stays editable in between.
          </Dialog.Description>
        </Dialog.Header>

        <div className="px-6">
          <BroadcastScheduleFields value={schedule} onChange={setSchedule} />
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isScheduleReady(schedule) || loading}
            onClick={() => onConfirm(schedule)}
          >
            {isRecurringForm(schedule) ? 'Start repeating' : 'Schedule'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
