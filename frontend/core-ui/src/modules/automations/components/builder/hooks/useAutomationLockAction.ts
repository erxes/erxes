import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

export const useAutomationLockAction = () => {
  const { detail } = useAutomation();
  const currentUser = useAtomValue(currentUserState);

  const automationId = detail?._id;
  const ownerId = detail?.createdBy;

  return {
    automationId,
    ownerId,
    canLock: !!automationId && currentUser?._id === ownerId,
  };
};
