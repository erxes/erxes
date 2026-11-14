import { useTemplatePreview } from '@/template/hooks/useTemplatePreview';
import { TTemplate } from '@/template/types';
import { useTranslation } from 'react-i18next';

const AI_AGENT_PART = 'automations:aiAgent';

/** A gallery card: its flow preview, one-line summary and what it installs. */
export const useTemplateCard = (template: TTemplate) => {
  const { t } = useTranslation('templates');
  const preview = useTemplatePreview(template);
  const isSegment = template.group === 'segment';
  const agentCount = template.parts.filter(
    ({ type }) => type === AI_AGENT_PART,
  ).length;

  const summary = [
    preview?.trigger.label,
    t('steps-to-answer', { count: template.requirements.length }),
  ]
    .filter(Boolean)
    .join(' · ');

  const contentsLabel = isSegment
    ? t('segment-count', { count: template.parts.length })
    : t('automation-count', { count: template.journeys.length });

  const agentLabel = agentCount
    ? ` · ${t('agent-count', { count: agentCount })}`
    : '';

  return {
    preview,
    isSegment,
    summary,
    installsLabel: `${contentsLabel}${agentLabel}`,
    installHref: `/templates/${template.pluginName}/${template.id}`,
  };
};
