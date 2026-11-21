import type { Broadcast, BroadcastSchedule } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconCalendarClock, IconRepeat } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Popover, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { ScheduleRepeat } from './repeat/ScheduleRepeat';
import { ScheduleOnce } from './ScheduleOnce';

const MODES = ['once', 'repeat'] as const;

type Mode = (typeof MODES)[number];

interface DialogProps {
  broadcast: Broadcast;
  prepare?: () => Promise<void>;
  onDone: () => void;
}

/** Once or repeating; a draft with a saved rule (a duplicate's) opens on repeating. */
const ScheduleForm = ({
  schedule,
  ...props
}: DialogProps & { schedule: BroadcastSchedule | null }) => {
  const { t } = useTranslation('broadcasts');
  const recurring = props.broadcast.status === 'recurring';
  const [mode, setMode] = useState<Mode>(schedule || recurring ? 'repeat' : 'once');

  return (
    <div className="space-y-3">
      {!recurring && (
        <ToggleGroup
          variant="outline"
          value={[mode]}
          onValueChange={([next]) => {
            const found = MODES.find((item) => item === next);

            if (found) setMode(found);
          }}
          className="w-full"
        >
          <ToggleGroup.Item value="once" className="flex-1">
            {t('repeat.once', 'Once')}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="repeat" className="flex-1">
            {t('repeat.repeat', 'Repeat')}
          </ToggleGroup.Item>
        </ToggleGroup>
      )}
      {mode === 'once' ? (
        <ScheduleOnce {...props} />
      ) : (
        <ScheduleRepeat {...props} schedule={schedule} />
      )}
    </div>
  );
};

/** The saved schedule first, so the fields open with it. */
const ScheduleDialog = (props: DialogProps) => {
  const schedule = useQuery(
    orpc.broadcastSchedules.get.queryOptions({ input: { id: props.broadcast.id } }),
  );

  return (
    <QueryState query={schedule} className="py-6">
      {(data) => <ScheduleForm {...props} schedule={data} />}
    </QueryState>
  );
};

/**
 * Sends once at a time the member picks, or repeats on a schedule; both on the organisation's
 * clock. On a recurring broadcast it changes the schedule.
 */
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
  const [open, setOpen] = useState(false);
  const recurring = broadcast.status === 'recurring';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="outline" disabled={disabled} />}>
        {recurring ? <IconRepeat /> : <IconCalendarClock />}
        {recurring ? t('repeat.edit', 'Edit schedule') : t('schedule', 'Schedule')}
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80">
        {open && (
          <ScheduleDialog broadcast={broadcast} prepare={prepare} onDone={() => setOpen(false)} />
        )}
      </Popover.Content>
    </Popover>
  );
};
