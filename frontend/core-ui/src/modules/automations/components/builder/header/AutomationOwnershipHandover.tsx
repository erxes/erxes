import { useAutomationOwnershipHandover } from '@/automations/hooks/useAutomationOwnershipHandover';
import { IconHourglass, IconSend } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ApprovalNotificationActions, SelectMember } from 'ui-modules';

/**
 * Handing the automation over is an offer, so this only asks. The change lands
 * when the other person approves it — nobody is made to answer for records
 * they never agreed to.
 */
export const AutomationOwnershipHandover = ({
  automationId,
  automationName,
}: {
  automationId?: string;
  automationName?: string;
}) => {
  const { t } = useTranslation('automations');
  const {
    pending,
    submitting,
    picking,
    startPicking,
    cancelPicking,
    onMemberPicked,
    onRequestCompleted,
  } = useAutomationOwnershipHandover(automationId, automationName);

  if (pending) {
    return (
      <div className="flex flex-col gap-2 rounded border border-warning/40 bg-warning/5 p-2">
        {/* Who it went to is in the summary below, so naming the current
            owner here only made it read like they were the one deciding. */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconHourglass className="size-3.5" />
          {t('ownership-waiting')}
        </p>
        <p className="text-sm">{pending.change?.summary}</p>
        <ApprovalNotificationActions
          request={pending}
          onCompleted={onRequestCompleted}
        />
      </div>
    );
  }

  if (!picking) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="justify-start px-0"
        onClick={startPicking}
      >
        <IconSend className="size-3.5" />
        {t('ownership-hand-over')}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded border p-2">
      <p className="text-xs text-muted-foreground">
        {t('ownership-hand-over-description')}
      </p>
      <div className="rounded border">
        <SelectMember.Provider mode="single" onValueChange={onMemberPicked}>
          <SelectMember.Content />
        </SelectMember.Provider>
      </div>
      {submitting && <Spinner />}
      <Button variant="ghost" size="sm" onClick={cancelPicking}>
        {t('cancel')}
      </Button>
    </div>
  );
};
