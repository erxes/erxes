import {
  clampAttempts,
  clampDelaySeconds,
  RETRY_LIMITS,
  TBackoff,
  useActionErrorPolicy,
} from '@/automations/components/builder/sidebar/components/content/action/useActionErrorPolicy';
import { TAutomationBuilderActions } from '@/automations/utils/automationFormDefinitions';
import { Input, Label, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  currentIndex: number;
  currentAction: TAutomationBuilderActions[number];
};

// Rendered in the node's secondary panel; the canvas reflects the branching.
export const ActionErrorPolicySection = ({
  currentIndex,
  currentAction,
}: Props) => {
  const { t } = useTranslation('automations');
  const { isSupported, policy, isRetrying, showDropWarning, apply } =
    useActionErrorPolicy(currentIndex, currentAction);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="retry-enabled">{t('error-retry-label')}</Label>
        <Switch
          id="retry-enabled"
          checked={isRetrying}
          onCheckedChange={(checked) => apply({ attempts: checked ? 1 : 0 })}
        />
      </div>

      {isRetrying && (
        <div className="flex flex-col gap-3 rounded border bg-background p-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="retry-attempts">{t('error-attempts-label')}</Label>
            <Input
              id="retry-attempts"
              type="number"
              min={1}
              max={RETRY_LIMITS.MAX_ATTEMPTS}
              value={policy.attempts}
              onChange={(e) =>
                apply({
                  attempts: clampAttempts(Number(e.currentTarget.value)),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="retry-delay">{t('error-delay-label')}</Label>
            <Input
              id="retry-delay"
              type="number"
              min={RETRY_LIMITS.MIN_DELAY_SECONDS}
              max={RETRY_LIMITS.MAX_DELAY_SECONDS}
              value={policy.delaySeconds}
              onChange={(e) =>
                apply({
                  delaySeconds: clampDelaySeconds(
                    Number(e.currentTarget.value),
                  ),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('error-backoff-label')}</Label>
            <Select
              value={policy.backoff}
              onValueChange={(value) => apply({ backoff: value as TBackoff })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">
                  {t('error-backoff-none')}
                </Select.Item>
                <Select.Item value="linear">
                  {t('error-backoff-linear')}
                </Select.Item>
                <Select.Item value="exponential">
                  {t('error-backoff-exponential')}
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="error-branch">{t('error-branch-label')}</Label>
          <p className="text-xs text-muted-foreground">
            {t('error-branch-description')}
          </p>
        </div>
        <Switch
          id="error-branch"
          checked={policy.branching}
          onCheckedChange={(checked) => apply({ branching: checked })}
        />
      </div>

      {showDropWarning && (
        <p className="text-xs text-warning">{t('error-branch-drop-warning')}</p>
      )}
    </div>
  );
};
