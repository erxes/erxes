import { useTemplateInstallationView } from '@/template/hooks/useTemplateInstallationView';
import { useRemoveTemplateInstallation } from '@/template/hooks/useTemplateInstallations';
import { TTemplateInstallation } from '@/template/types';
import { useCallback, useMemo } from 'react';

const DEFAULT_AUTOMATION_ICON = 'IconSitemap';

/**
 * One installation's page: each automation as a draft to review and switch
 * on, the parts it made, and removing it once none of its automations is on.
 */
export const useTemplateInstallationDetail = (
  installation: TTemplateInstallation,
) => {
  const { removeInstallation, loading } = useRemoveTemplateInstallation();
  const { icon, justInstalled, automations, parts, activeCount } =
    useTemplateInstallationView(installation);
  const hasActive = activeCount > 0;

  const automationRows = useMemo(
    () =>
      automations.map((automation) => ({
        ...automation,
        isActive: automation.status === 'active',
        icon: automation.icon || DEFAULT_AUTOMATION_ICON,
        href: `/automations/edit/${automation._id}`,
      })),
    [automations],
  );

  const remove = useCallback(
    () => removeInstallation(installation),
    [removeInstallation, installation],
  );

  return {
    icon,
    justInstalled,
    installedAtValues: {
      date: new Date(installation.createdAt).toLocaleString(),
      version: installation.version,
    },
    automationRows,
    hasAutomations: automations.length > 0,
    progress: { active: activeCount, total: automations.length },
    parts,
    removeHintKey: hasActive ? 'remove-blocked' : 'remove-hint',
    removeDisabled: hasActive || loading,
    remove,
  };
};
