import { TRegisteredTemplate, TTemplateNodeDetails } from '../registry';
import { buildJourneyPreview } from '@/template/preview';

// The flow itself stays on the server; a viewer sees what each journey is
export const convertToTemplateView = (
  template: TRegisteredTemplate,
  nodes: Map<string, TTemplateNodeDetails>,
) => ({
  id: template.id,
  pluginName: template.pluginName,
  version: template.version,
  name: template.name,
  description: template.description,
  icon: template.icon,
  requirements: template.requirements,
  parts: template.parts.map(({ key, type, label, icon, defaults }) => ({
    key,
    type,
    label,
    icon,
    name: typeof defaults.name === 'string' ? defaults.name : undefined,
  })),
  journeys: template.journeys.map((journey) => ({
    key: journey.key,
    name: journey.name,
    description: journey.description,
    triggerType: journey.trigger.type,
    stepCount: journey.flow.length,
    preview: buildJourneyPreview(journey, nodes),
  })),
});
