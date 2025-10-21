import { useAutomation } from '@/automations/context/AutomationProvider';

export const useActionNodeSourceHandler = (type: string) => {
  const { actionsConst } = useAutomation();

  const action = actionsConst.find((action) => action.type === type);

  const hasFolks = action?.folks?.length;

  return {
    hasFolks,
    folks: action?.folks || [],
  };
};
