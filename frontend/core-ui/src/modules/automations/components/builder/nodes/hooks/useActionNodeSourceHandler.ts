import { useAutomation } from '@/automations/context/AutomationProvider';
import { resolveActionFolks } from '@/automations/utils/automationBuilderUtils/actionFolks';

export const useActionNodeSourceHandler = (
  type: string,
  config?: Record<string, any>,
) => {
  const { actionFolks } = useAutomation();

  const folks = resolveActionFolks(type, config, actionFolks);

  return {
    hasFolks: folks.length > 0,
    folks,
  };
};
