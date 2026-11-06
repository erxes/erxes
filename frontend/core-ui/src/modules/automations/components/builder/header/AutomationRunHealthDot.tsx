import { useAutomationRunHealth } from '@/automations/hooks/useAutomationRunHealth';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Marks the history tab while recent runs are failing. */
export const AutomationRunHealthDot = () => {
  const { t } = useTranslation('automations');
  const { level, failed, checked } = useAutomationRunHealth();

  if (!level) {
    return null;
  }

  const label = t(
    level === 'failing' ? 'run-health-failing' : 'run-health-degraded',
    { failed, count: checked },
  );

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'relative z-10 size-2 shrink-0 rounded-full',
        level === 'failing' ? 'bg-destructive' : 'bg-warning',
      )}
    />
  );
};
