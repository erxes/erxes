import { useCallProConfig } from '@/integrations/callpro/hooks/useCallProConfig';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { useMemo } from 'react';

type TIntegrationKind = keyof typeof INTEGRATIONS;

export type TIntegrationEntry = (typeof INTEGRATIONS)[TIntegrationKind] & {
  type: TIntegrationKind;
};

const INTEGRATION_KINDS = Object.keys(INTEGRATIONS) as TIntegrationKind[];

export const useIntegrationEntries = (): TIntegrationEntry[] => {
  const { enabled: callProEnabled } = useCallProConfig();

  return useMemo(
    () =>
      INTEGRATION_KINDS.filter(
        (type) => type !== IntegrationType.CALLPRO || callProEnabled,
      ).map((type) => ({ type, ...INTEGRATIONS[type] })),
    [callProEnabled],
  );
};
