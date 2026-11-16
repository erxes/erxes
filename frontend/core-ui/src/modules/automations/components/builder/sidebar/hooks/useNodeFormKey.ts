import { automationNodeRestoreKeyState } from '@/automations/states/automationVersionState';
import { useAtomValue } from 'jotai';

/** A node form's key: a new node, or a restored version, mounts it afresh. */
export const useNodeFormKey = (nodeId?: string) => {
  const restoreKey = useAtomValue(automationNodeRestoreKeyState);

  return `${nodeId || ''}:${restoreKey}`;
};
