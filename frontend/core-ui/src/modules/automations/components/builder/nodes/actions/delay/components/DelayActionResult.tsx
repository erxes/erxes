import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { ActionResult } from 'ui-modules';

const getDelayText = (actionConfig?: { value?: number; type?: string }) => {
  const { value, type } = actionConfig || {};

  return value && type ? `Delaying for: ${value} ${type}s` : 'Delaying';
};

export const DelayActionResult = ({ action }: ActionResultComponentProps) => (
  <ActionResult.Status status="waiting">
    {getDelayText(action?.actionConfig)}
  </ActionResult.Status>
);
