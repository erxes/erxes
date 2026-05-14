import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';

export const useAutomationNodes = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const [triggers = [], actions = [], workflows = []] = useWatch({
    control,
    name: ['triggers', 'actions', 'workflows'],
  });

  const getList = (type: AutomationNodeType) =>
    ({
      [AutomationNodeType.Trigger]: triggers,
      [AutomationNodeType.Action]: actions,
      [AutomationNodeType.Workflow]: workflows,
    }[type]);

  return {
    triggers,
    actions,
    workflows,
    getList,
  };
};
