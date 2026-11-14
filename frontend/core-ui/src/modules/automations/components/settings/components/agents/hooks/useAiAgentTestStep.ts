import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { TAiAgentHealthCheckStatus } from '@/automations/components/settings/components/agents/hooks/useAiAgentHealth';
import { useCallback } from 'react';

const HEALTH_LABELS: Record<string, string> = {
  schema: 'Schema',
  credentials: 'Credentials',
  files: 'Context files',
  endpoint: 'Endpoint',
  model: 'Model access',
};

const CHECK_VARIANTS: Record<
  TAiAgentHealthCheckStatus,
  'success' | 'warning' | 'destructive' | 'secondary'
> = {
  ok: 'success',
  warning: 'warning',
  error: 'destructive',
  skipped: 'secondary',
};

const isValidDate = (value?: string) =>
  !!value && !Number.isNaN(new Date(value).getTime());

/** The saved agent's health check: running it and each check's outcome. */
export const useAiAgentTestStep = () => {
  const { isEditing, health: healthState } = useAiAgentDetailContext();
  const { health, loading, refetch } = healthState;

  const runCheck = useCallback(() => void refetch(), [refetch]);

  const checks = Object.entries(health?.checks || {}).map(([key, status]) => ({
    key,
    label: HEALTH_LABELS[key] || key,
    status,
    variant: CHECK_VARIANTS[status],
  }));

  return {
    isEditing,
    health,
    loading,
    runCheck,
    hasCheckedAt: isValidDate(health?.checkedAt),
    showSkeleton: loading && !health,
    checks,
  };
};
