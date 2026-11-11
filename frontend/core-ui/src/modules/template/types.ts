export type TTemplateRequirement = {
  key: string;
  kind: string;
  label: string;
  description?: string;
  dependsOn?: string;
  input?: { multiline?: boolean; placeholder?: string };
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

export type TTemplate = {
  id: string;
  pluginName: string;
  version: number;
  name: string;
  description?: string;
  icon?: string;
  requirements: TTemplateRequirement[];
  parts: { key: string; type: string }[];
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
