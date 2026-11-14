import { useTemplateWizardContext } from '@/template/context/TemplateWizardContext';

/** What the "already installed" warning says, or null when it is not due. */
export const useTemplatePriorInstallsAlert = () => {
  const { template, priorInstalls } = useTemplateWizardContext();
  const { installations, automationCount, activeCount, latest } = priorInstalls;

  if (!template || !latest) {
    return null;
  }

  const isSegment = template.group === 'segment';

  return {
    titleValues: { count: installations.length },
    bodyKey: isSegment
      ? 'already-installed-segment-body'
      : 'already-installed-body',
    bodyValues: { count: automationCount, active: activeCount },
    latestHref: `/templates/installations/${latest._id}`,
  };
};
