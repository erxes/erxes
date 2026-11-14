export type TBuiltInTemplateStep = {
  order: number;
  type: string;
  label?: string;
  description?: string;
  icon?: string;
  config?: Record<string, any>;
  next?: number | Record<string, number>;
};

export type TBuiltInTemplateRequirement = {
  key: string;
  kind: string;
  label: string;
  description?: string;
  fills?: { order: number; path: string; from?: string }[];
  dependsOn?: string;
  // For `core:text`
  input?: { multiline?: boolean; placeholder?: string };
};

export type TBuiltInTemplate = {
  id: string;
  name: string;
  description?: string;
  pluginName?: string;
  flow: TBuiltInTemplateStep[];
  requirements?: TBuiltInTemplateRequirement[];
};
