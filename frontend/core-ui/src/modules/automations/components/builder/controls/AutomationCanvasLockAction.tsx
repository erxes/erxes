import {
  CANVAS_ACTIVE_CONTROL_BUTTON_CLASS,
  CANVAS_CONTROL_BUTTON_CLASS,
} from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationLockAction } from '@/automations/components/builder/hooks/useAutomationLockAction';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { Button, Spinner, cn } from 'erxes-ui';
import { ApprovalLockButton } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasLockAction = () => {
  const { t } = useTranslation('automations');
  const { automationId, canLock, ownerId } = useAutomationLockAction();

  if (!automationId || !canLock) {
    return null;
  }

  return (
    <ApprovalLockButton
      contentType={AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION}
      contentId={automationId}
      ownerId={ownerId}
      action="edit"
      whenUnlocked={({ loading }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={loading}
          title={t('controls-lock-automation')}
          className={CANVAS_CONTROL_BUTTON_CLASS}
        >
          {loading ? <Spinner /> : <IconLock />}
        </Button>
      )}
      whenLocked={({ canRelease, loading, onRelease }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canRelease || loading}
          onClick={onRelease}
          title={
            canRelease ? t('controls-unlock-automation') : t('controls-locked')
          }
          className={cn(
            CANVAS_CONTROL_BUTTON_CLASS,
            CANVAS_ACTIVE_CONTROL_BUTTON_CLASS,
          )}
        >
          {loading ? <Spinner /> : <IconLockOpen />}
        </Button>
      )}
    />
  );
};
