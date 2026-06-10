export const AUTOMATION_EDGE_TYPES = [
  { value: 'default', label: 'Bezier' },
  { value: 'straight', label: 'Straight' },
  { value: 'step', label: 'Step' },
  { value: 'smoothstep', label: 'Smooth step' },
] as const;

export type TAutomationEdgeType =
  (typeof AUTOMATION_EDGE_TYPES)[number]['value'];

export const AUTOMATION_EDGE_TYPE_VALUES = AUTOMATION_EDGE_TYPES.map(
  ({ value }) => value,
) as [TAutomationEdgeType, ...TAutomationEdgeType[]];
