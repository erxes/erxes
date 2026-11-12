import { TTemplateRequirement } from 'erxes-api-shared/core-modules';
import { TRegisteredTemplate, TTemplateNodeDetails } from '../registry';
import {
  buildJourneyPreview,
  TTemplateJourneyPreview,
} from '@/template/preview';

// Named so the resolver maps stay within what tsc serializes (TS7056)
export type TTemplateView = {
  id: string;
  pluginName: string;
  version: number;
  name: string;
  description?: string;
  icon?: string;
  requirements: TTemplateRequirement[];
  parts: {
    key: string;
    type: string;
    label?: string;
    icon?: string;
    name?: string;
  }[];
  journeys: {
    key: string;
    name: string;
    description?: string;
    triggerType: string;
    stepCount: number;
    preview: TTemplateJourneyPreview;
  }[];
};

// The flow itself stays on the server; a viewer sees what each journey is
export const convertToTemplateView = (
  template: TRegisteredTemplate,
  nodes: Map<string, TTemplateNodeDetails>,
): TTemplateView => ({
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
