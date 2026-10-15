export const AUTOMATION_EDGE_TYPES = [
  { value: 'default', labelKey: 'edge-type-bezier' },
  { value: 'straight', labelKey: 'edge-type-straight' },
  { value: 'step', labelKey: 'edge-type-step' },
  { value: 'smoothstep', labelKey: 'edge-type-smoothstep' },
] as const;

export type TAutomationEdgeType =
  (typeof AUTOMATION_EDGE_TYPES)[number]['value'];

export const AUTOMATION_EDGE_TYPE_VALUES = AUTOMATION_EDGE_TYPES.map(
  ({ value }) => value,
) as [TAutomationEdgeType, ...TAutomationEdgeType[]];
