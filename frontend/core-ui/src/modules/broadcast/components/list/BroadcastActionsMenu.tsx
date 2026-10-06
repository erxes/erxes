import {
  TBroadcastCampaign,
  useBroadcastCampaignActions,
} from '@/broadcast/hooks/useBroadcastCampaignActions';
import {
  IconCalendarOff,
  IconCalendarClock,
  IconCopy,
  IconEye,
  IconPencil,
  IconPlayerPauseFilled,
  IconTestPipe,
} from '@tabler/icons-react';
import { Combobox, Command, Popover } from 'erxes-ui';
import { BroadcastDryRunDialog } from '../common/BroadcastDryRunDialog';
import { BroadcastScheduleDialog } from '../common/BroadcastScheduleDialog';
import { ReactNode, useState } from 'react';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

/**
 * The same menu wherever a campaign is listed.
 *
 * What a campaign can be asked to do, and what happens when it is asked, both
 * live in `useBroadcastCampaignActions`; keeping the menu itself in one place
 * is what stops the table and the grid drifting into offering different things.
 */
export const BroadcastActionsMenu = ({
  campaign,
  trigger,
}: {
  campaign: TBroadcastCampaign;
  trigger: ReactNode;
}) => {
  const { t } = useTranslation('broadcasts');
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const {
    canEdit,
    canPause,
    canCopy,
    canCancelSchedule,
    canSchedule,
    preview,
    edit,
    duplicate,
    pause,
    schedule,
    scheduleDialog,
    cancelSchedule,
  } = useBroadcastCampaignActions(campaign);

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="preview" onSelect={preview}>
                <IconEye /> {t('actions.preview')}
              </Command.Item>
              {campaign.method === 'email' && (
                <Command.Item
                  value="dry-run"
                  onSelect={() => setIsDryRunOpen(true)}
                >
                  <IconTestPipe /> {t('actions.dry-run')}
                </Command.Item>
              )}
              {canEdit && (
                <Can action="broadcastUpdate">
                  <Command.Item value="edit" onSelect={edit}>
                    <IconPencil /> {t('actions.edit')}
                  </Command.Item>
                </Can>
              )}
              {canCopy && (
                <Can action="broadcastCreate">
                  <Command.Item value="duplicate" onSelect={duplicate}>
                    <IconCopy /> {t('actions.duplicate')}
                  </Command.Item>
                </Can>
              )}
              {canPause && (
                <Can action="broadcastUpdate">
                  <Command.Item value="pause" onSelect={pause}>
                    <IconPlayerPauseFilled /> {t('actions.pause')}
                  </Command.Item>
                </Can>
              )}
              {canSchedule && (
                <Can action="broadcastUpdate">
                  <Command.Item value="schedule" onSelect={schedule}>
                    <IconCalendarClock /> {t('actions.schedule')}
                  </Command.Item>
                </Can>
              )}
              {canCancelSchedule && (
                <Can action="broadcastUpdate">
                  <Command.Item
                    value="cancel-schedule"
                    onSelect={cancelSchedule}
                  >
                    <IconCalendarOff /> {t('actions.cancel-schedule')}
                  </Command.Item>
                </Can>
              )}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      <BroadcastScheduleDialog {...scheduleDialog} />

      <BroadcastDryRunDialog
        campaignId={campaign._id}
        open={isDryRunOpen}
        onOpenChange={setIsDryRunOpen}
      />
    </>
  );
};
