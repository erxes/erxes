export const AUTOMATION_FLOW_DIRECTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
] as const;

export type TAutomationFlowDirection =
  (typeof AUTOMATION_FLOW_DIRECTIONS)[number]['value'];

export const AUTOMATION_FLOW_DIRECTION_VALUES = AUTOMATION_FLOW_DIRECTIONS.map(
  ({ value }) => value,
) as [TAutomationFlowDirection, ...TAutomationFlowDirection[]];
