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

  const activeIds = useMemo(() => {
    const ids = new Set(enabledIds);
    if (callConfig?.isAvailable && callConfig.inboxId) {
      ids.add(callConfig.inboxId);
    }
    return ids;
  }, [enabledIds, callConfig?.inboxId, callConfig?.isAvailable]);

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
      setEnabledIds(Array.from(new Set([...activeIds, inboxId])));
      if (!callConfig?.isAvailable) {
        setCallConfig({ ...integration, isAvailable: true });
      }
      return;
    }

    const remainingIds = Array.from(activeIds).filter((id) => id !== inboxId);
    setEnabledIds(remainingIds);

    if (callConfig?.inboxId !== inboxId) {
      return;
    }

    const nextIntegration = (callUserIntegrations || []).find(
      (item) => !!item.inboxId && remainingIds.includes(item.inboxId),
    );

    setCallConfig(
      nextIntegration
        ? { ...nextIntegration, isAvailable: true }
        : { ...integration, isAvailable: false },
    );
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
