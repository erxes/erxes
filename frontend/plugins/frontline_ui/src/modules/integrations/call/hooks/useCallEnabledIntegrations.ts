import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import {
  callConfigAtom,
  callEnabledIntegrationIdsAtom,
} from '@/integrations/call/states/sipStates';
import { ICallConfig } from '@/integrations/call/types/callTypes';
import { useAtom } from 'jotai';
import { useMemo } from 'react';

export const useCallEnabledIntegrations = () => {
  const { callUserIntegrations, loading } = useCallUserIntegration();
  const [enabledIds, setEnabledIds] = useAtom(callEnabledIntegrationIdsAtom);
  const [callConfig, setCallConfig] = useAtom(callConfigAtom);

  // Persisted ids may name integrations the user no longer operates.
  const activeIds = useMemo(() => {
    const validIds = new Set(
      (callUserIntegrations || []).map((integration) => integration.inboxId),
    );
    const ids = new Set(enabledIds.filter((id) => validIds.has(id)));
    if (
      callConfig?.isAvailable &&
      callConfig.inboxId &&
      validIds.has(callConfig.inboxId)
    ) {
      ids.add(callConfig.inboxId);
    }
    return ids;
  }, [
    callUserIntegrations,
    enabledIds,
    callConfig?.inboxId,
    callConfig?.isAvailable,
  ]);

  const enabledIntegrations = useMemo(
    () =>
      (callUserIntegrations || []).filter(
        (integration) =>
          !!integration.inboxId && activeIds.has(integration.inboxId),
      ),
    [callUserIntegrations, activeIds],
  );

  const isEnabled = (inboxId: string) => activeIds.has(inboxId);

  const toggleIntegration = (integration: ICallConfig, checked: boolean) => {
    const { inboxId } = integration;

    if (!inboxId) {
      return;
    }

    if (checked) {
      setEnabledIds((prev) => Array.from(new Set([...prev, inboxId])));
      setCallConfig((prev) =>
        prev?.isAvailable && activeIds.has(prev.inboxId || '')
          ? prev
          : { ...integration, isAvailable: true },
      );
      return;
    }

    const remainingIds = Array.from(activeIds).filter((id) => id !== inboxId);
    setEnabledIds((prev) => prev.filter((id) => id !== inboxId));

    const nextIntegration = (callUserIntegrations || []).find(
      (item) => !!item.inboxId && remainingIds.includes(item.inboxId),
    );

    setCallConfig((prev) => {
      if (prev?.inboxId !== inboxId) return prev;
      return nextIntegration
        ? { ...nextIntegration, isAvailable: true }
        : { ...integration, isAvailable: false };
    });
  };

  const selectCallFrom = (inboxId: string) => {
    const selectedIntegration = enabledIntegrations.find(
      (integration) => integration.inboxId === inboxId,
    );
    if (!selectedIntegration) {
      return;
    }
    setCallConfig({ ...selectedIntegration, isAvailable: true });
  };

  return {
    enabledIntegrations,
    isEnabled,
    toggleIntegration,
    selectCallFrom,
    loading,
  };
};
