import { resolveTriggerFolks } from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useTriggerNodeFolks = (config?: Record<string, any>) => {
  const { t } = useTranslation('automations');

  const folks = useMemo(
    () =>
      resolveTriggerFolks(config).map((folk) => ({
        ...folk,
        label: t(folk.label),
      })),
    [config, t],
  );

  return { folks, hasFolks: folks.length > 0 };
};
