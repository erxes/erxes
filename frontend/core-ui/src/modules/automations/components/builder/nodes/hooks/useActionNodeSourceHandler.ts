import { useAutomation } from '@/automations/context/AutomationProvider';

export const useActionNodeSourceHandler = (type: string) => {
  const { actionConstMap } = useAutomation();

  const action = actionConstMap.get(type);

  const hasFolks = action?.folks?.length;

  return {
    hasFolks,
    folks: action?.folks || [],
  };
};
