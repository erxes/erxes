import { TAutomationRecordTableColumnDefData } from '@/automations/types';
import { readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const FALLBACK_TRIGGER_ICON = 'IconPointerBolt';

/** What starts the automation, and how many steps follow it. */
export const useAutomationTriggerCell = (
  automation: TAutomationRecordTableColumnDefData,
) => {
  const { t } = useTranslation('automations');
  const [trigger] = automation.triggers || [];
  const extraTriggers = Math.max((automation.triggers || []).length - 1, 0);

  return {
    icon: trigger?.icon || FALLBACK_TRIGGER_ICON,
    label: trigger?.label || trigger?.type || t('list-no-trigger'),
    hasTrigger: !!trigger,
    extraTriggersLabel: extraTriggers ? `+${extraTriggers}` : '',
    stepsLabel: t('list-steps', {
      count: (automation.actions || []).length,
    }),
  };
};

/** When the automation was last changed, and by whom. */
export const useAutomationUpdatedCell = (
  automation: TAutomationRecordTableColumnDefData,
) => {
  const user = automation.updatedUser;
  const fullName = user?.details?.fullName || user?.email || '';

  return {
    updatedAt: automation.updatedAt,
    userName: fullName,
    avatarSrc: readImage(user?.details?.avatar),
    initial: fullName.charAt(0).toUpperCase(),
  };
};
