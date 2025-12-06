export const TEMPLATE_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type TemplateStatus =
  (typeof TEMPLATE_STATUS)[keyof typeof TEMPLATE_STATUS];
