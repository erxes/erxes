export type TTemplateRequirement = {
  key: string;
  kind: string;
  label: string;
  description?: string;
  dependsOn?: string;
  input?: { multiline?: boolean; placeholder?: string };
  defaultAnswer?: unknown;
  // Which journey this fills into, so its trigger's variables can be offered
  // while answering (a 'part' fill has none)
  fills?: { journey?: string }[];
};

export type TTemplatePreviewNode = { label: string; icon?: string };

export type TTemplateJourney = {
  key: string;
  name: string;
  description?: string;
  triggerType: string;
  stepCount: number;
  // Read from the flow on the server: trigger, entry step, its branches
  preview?: {
    trigger: TTemplatePreviewNode;
    hub?: TTemplatePreviewNode;
    branches: TTemplatePreviewNode[];
  };
};

// Read from what the template builds: no journeys, one, or several
export type TTemplateGroup = 'segment' | 'automation' | 'solution';

export type TTemplate = {
  id: string;
  pluginName: string;
  version: number;
  name: string;
  description?: string;
  icon?: string;
  group: TTemplateGroup;
  requirements: TTemplateRequirement[];
  parts: {
    key: string;
    type: string;
    label?: string;
    icon?: string;
    name?: string;
  }[];
  journeys: TTemplateJourney[];
};

export type TTemplateInstalledAutomation = {
  _id: string;
  journey: string;
  name: string;
  status: string;
};

export type TTemplateInstallation = {
  _id: string;
  templateId: string;
  pluginName: string;
  version: number;
  name: string;
  partIds?: Record<string, string>;
  automations?: TTemplateInstalledAutomation[];
  createdBy?: string;
  createdAt: string;
};

export type TTemplateAnswers = Record<string, unknown>;
