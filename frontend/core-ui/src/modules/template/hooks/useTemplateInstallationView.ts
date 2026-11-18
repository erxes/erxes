import { useTemplateDetail } from '@/template/hooks/useTemplates';
import { TTemplateInstallation } from '@/template/types';
import { templateJourneyShortName } from '@/template/utils/templateWizard';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

const AI_AGENT_PART = 'automations:aiAgent';

/**
 * An installation read with its template: each automation with its
 * journey's icon and purpose, each part with its name, and whether the
 * person arrived here straight from installing.
 */
export const useTemplateInstallationView = (
  installation: TTemplateInstallation,
) => {
  const [searchParams] = useSearchParams();
  // Unavailable when its plugin is off; names then come from the record
  const { template } = useTemplateDetail(
    installation.pluginName,
    installation.templateId,
  );

  return useMemo(() => {
    const automations = (installation.automations || []).map((automation) => {
      const journey = template?.journeys.find(
        ({ key }) => key === automation.journey,
      );

      return {
        ...automation,
        shortName: templateJourneyShortName(automation.name, installation.name),
        description: journey?.description,
        icon: journey?.preview?.trigger.icon,
      };
    });

    const parts = Object.entries(installation.partIds || {}).map(
      ([key, _id]) => {
        const part = template?.parts.find((item) => item.key === key);
        // Installs from before parts were recorded made only AI agents
        const isAgent = !part || part.type === AI_AGENT_PART;

        return {
          key,
          name: part?.name || part?.label || key,
          kind: part?.label,
          isAgent,
          icon: isAgent ? 'IconRobot' : part?.icon || 'IconBox',
          href: isAgent ? `${AutomationSettingsPath.Agents}/${_id}` : undefined,
        };
      },
    );

    return {
      icon: template?.icon || 'IconSparkles',
      justInstalled: searchParams.get('installed') === '1',
      automations,
      parts,
      activeCount: automations.filter(({ status }) => status === 'active')
        .length,
    };
  }, [installation, template, searchParams]);
};
