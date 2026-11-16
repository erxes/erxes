import { useTemplateInstallations } from '@/template/hooks/useTemplateInstallations';
import { TTemplate, TTemplateInstallation } from '@/template/types';
import { useMemo } from 'react';

export type TTemplatePriorInstalls = {
  installations: TTemplateInstallation[];
  automationCount: number;
  activeCount: number;
  latest?: TTemplateInstallation;
};

const isSameTemplate = (
  installation: TTemplateInstallation,
  template: TTemplate,
) =>
  installation.templateId === template.id &&
  installation.pluginName === template.pluginName;

// A segment install leaves segments behind; others leave their automations
const leftSomethingBehind = (
  installation: TTemplateInstallation,
  template: TTemplate,
) => template.group === 'segment' || !!installation.automations?.length;

const isPriorInstallOf =
  (template: TTemplate) => (installation: TTemplateInstallation) =>
    isSameTemplate(installation, template) &&
    leftSomethingBehind(installation, template);

const summarize = (
  installations: TTemplateInstallation[],
): TTemplatePriorInstalls => {
  const automations = installations.flatMap(
    (installation) => installation.automations || [],
  );

  return {
    installations,
    automationCount: automations.length,
    activeCount: automations.filter(({ status }) => status === 'active').length,
    // The list query is sorted newest first
    latest: installations[0],
  };
};

/**
 * Earlier installs of this template that still left something behind, so
 * installing again would make duplicates.
 */
export const useTemplatePriorInstalls = (
  template?: TTemplate,
): TTemplatePriorInstalls => {
  const { installations } = useTemplateInstallations();

  return useMemo(
    () =>
      summarize(
        template ? installations.filter(isPriorInstallOf(template)) : [],
      ),
    [installations, template],
  );
};

/** The confirm message's key and values when installing again. */
export const reinstallConfirmOf = (
  template: TTemplate,
  { installations, automationCount }: TTemplatePriorInstalls,
) => ({
  key:
    template.group === 'segment'
      ? 'reinstall-confirm-segment'
      : 'reinstall-confirm',
  values: { count: installations.length, automations: automationCount },
});
