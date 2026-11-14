import { useAutomation } from '@/automations/context/AutomationProvider';
import { useConnection } from '@xyflow/react';
import { MouseEvent, useCallback } from 'react';

/**
 * The "add step" button on a handle: it marks the handle as waiting for the
 * next step, and a second click on the same handle cancels that.
 */
export const useAwaitToConnectButton = (nodeHandleId: string) => {
  const {
    awaitingToConnectNodeId,
    setAwaitingToConnectNodeId,
    setQueryParams,
  } = useAutomation();
  const isConnectionDragging = useConnection(
    (connection) => connection.inProgress,
  );
  const isSelected = awaitingToConnectNodeId === nodeHandleId;

  const toggleAwaiting = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!awaitingToConnectNodeId) {
        setQueryParams({ activeNodeId: null });
      }

      setAwaitingToConnectNodeId(isSelected ? '' : nodeHandleId);
    },
    [
      awaitingToConnectNodeId,
      isSelected,
      nodeHandleId,
      setAwaitingToConnectNodeId,
      setQueryParams,
    ],
  );

  return { isSelected, isConnectionDragging, toggleAwaiting };
};
