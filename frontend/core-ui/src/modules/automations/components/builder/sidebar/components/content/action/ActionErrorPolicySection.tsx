import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import {
  isBranchingOnError,
  supportsErrorPolicy,
} from '@/automations/utils/automationBuilderUtils/actionFolks';
import {
  TAutomationBuilderActions,
  TAutomationBuilderForm,
} from '@/automations/utils/automationFormDefinitions';
import { Input, Label, Select, Switch } from 'erxes-ui';
import { Path, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// Mirrors AUTOMATION_RETRY_LIMITS in erxes-api-shared; the engine clamps to the
// same numbers, so a hand-edited automation cannot exceed them either.
const LIMITS = {
  MAX_ATTEMPTS: 5,
  MIN_DELAY_SECONDS: 5,
  MAX_DELAY_SECONDS: 3600,
  DEFAULT_DELAY_SECONDS: 60,
};

type TBackoff = 'none' | 'linear' | 'exponential';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);

const readPolicy = (config: Record<string, any> | undefined) => {
  const retry = config?.errorPolicy?.retry || {};

  return {
    attempts: clamp(Number(retry.attempts ?? 0), 0, LIMITS.MAX_ATTEMPTS),
    delaySeconds: clamp(
      Number(retry.delaySeconds ?? LIMITS.DEFAULT_DELAY_SECONDS),
      LIMITS.MIN_DELAY_SECONDS,
      LIMITS.MAX_DELAY_SECONDS,
    ),
    backoff: (retry.backoff || 'none') as TBackoff,
    branching: isBranchingOnError(config),
  };
};

type Props = {
  currentIndex: number;
  currentAction: TAutomationBuilderActions[number];
};

/**
 * Sits under every action's own form, so what happens when a step fails is
 * configured where the step is configured — and the canvas shows the result.
 */
export const ActionErrorPolicySection = ({
  currentIndex,
  currentAction,
}: Props) => {
  const { actionConstMap } = useAutomation();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { t } = useTranslation('automations');

  if (!supportsErrorPolicy(actionConstMap.get(currentAction.type))) {
    return null;
  }

  const config = (currentAction.config || {}) as Record<string, any>;
  const doc = readPolicy(config);

  const apply = (next: Partial<typeof doc>) => {
    const merged = { ...doc, ...next };
    const nextConfig = { ...config };
    let nextActionId = currentAction.nextActionId;

    // Turning the policy on renames the single outgoing edge into the success
    // one, and turning it off hands it back, so wiring already on the canvas
    // survives the switch either way.
    if (merged.branching && !doc.branching) {
      nextConfig.onSuccessActionId =
        nextActionId || nextConfig.onSuccessActionId || '';
      nextActionId = '';
    }

    if (!merged.branching && doc.branching) {
      nextActionId = nextConfig.onSuccessActionId || '';
      nextConfig.onSuccessActionId = '';
      nextConfig.onErrorActionId = '';
    }

    setAutomationBuilderFormValue(
      `actions.${currentIndex}` as Path<TAutomationBuilderForm>,
      {
        ...currentAction,
        nextActionId,
        config: {
          ...nextConfig,
          errorPolicy: {
            retry: {
              attempts: merged.attempts,
              delaySeconds: merged.delaySeconds,
              backoff: merged.backoff,
            },
            onError: merged.branching ? 'branch' : 'fail',
          },
        },
      } as PathValue<TAutomationBuilderForm, Path<TAutomationBuilderForm>>,
      { shouldValidate: true, shouldDirty: true },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="retry-enabled">{t('error-retry-label')}</Label>
        <Switch
          id="retry-enabled"
          checked={doc.attempts > 0}
          onCheckedChange={(checked) => apply({ attempts: checked ? 1 : 0 })}
        />
      </div>

      {doc.attempts > 0 && (
        <div className="flex flex-col gap-3 rounded border bg-background p-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="retry-attempts">{t('error-attempts-label')}</Label>
            <Input
              id="retry-attempts"
              type="number"
              min={1}
              max={LIMITS.MAX_ATTEMPTS}
              value={doc.attempts}
              onChange={(e) =>
                apply({
                  attempts: clamp(
                    Number(e.currentTarget.value),
                    1,
                    LIMITS.MAX_ATTEMPTS,
                  ),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="retry-delay">{t('error-delay-label')}</Label>
            <Input
              id="retry-delay"
              type="number"
              min={LIMITS.MIN_DELAY_SECONDS}
              max={LIMITS.MAX_DELAY_SECONDS}
              value={doc.delaySeconds}
              onChange={(e) =>
                apply({
                  delaySeconds: clamp(
                    Number(e.currentTarget.value),
                    LIMITS.MIN_DELAY_SECONDS,
                    LIMITS.MAX_DELAY_SECONDS,
                  ),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('error-backoff-label')}</Label>
            <Select
              value={doc.backoff}
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
          checked={doc.branching}
          onCheckedChange={(checked) => apply({ branching: checked })}
        />
      </div>

      {doc.branching && !!config.onErrorActionId && (
        <p className="text-xs text-warning">{t('error-branch-drop-warning')}</p>
      )}
    </div>
  );
};
