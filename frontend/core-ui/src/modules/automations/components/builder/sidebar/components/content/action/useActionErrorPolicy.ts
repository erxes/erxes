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
import { useCallback } from 'react';
import { Path, PathValue } from 'react-hook-form';

// Mirrors AUTOMATION_RETRY_LIMITS in erxes-api-shared; the engine clamps to the
// same numbers, so a hand-edited automation cannot exceed them either.
export const RETRY_LIMITS = {
  MAX_ATTEMPTS: 5,
  MIN_DELAY_SECONDS: 5,
  MAX_DELAY_SECONDS: 3600,
  DEFAULT_DELAY_SECONDS: 60,
};

export type TBackoff = 'none' | 'linear' | 'exponential';

type TPolicyConfig = {
  errorPolicy?: {
    retry?: { attempts?: number; delaySeconds?: number; backoff?: TBackoff };
    onError?: string;
  };
  onSuccessActionId?: string;
  onErrorActionId?: string;
  [key: string]: unknown;
};

type TPolicy = {
  attempts: number;
  delaySeconds: number;
  backoff: TBackoff;
  branching: boolean;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);

export const clampAttempts = (value: number) =>
  clamp(value, 1, RETRY_LIMITS.MAX_ATTEMPTS);

export const clampDelaySeconds = (value: number) =>
  clamp(value, RETRY_LIMITS.MIN_DELAY_SECONDS, RETRY_LIMITS.MAX_DELAY_SECONDS);

const readPolicy = (config: TPolicyConfig): TPolicy => {
  const retry = config.errorPolicy?.retry || {};

  return {
    attempts: clamp(Number(retry.attempts ?? 0), 0, RETRY_LIMITS.MAX_ATTEMPTS),
    delaySeconds: clampDelaySeconds(
      Number(retry.delaySeconds ?? RETRY_LIMITS.DEFAULT_DELAY_SECONDS),
    ),
    backoff: retry.backoff || 'none',
    branching: isBranchingOnError(config),
  };
};

/**
 * Turning the policy on renames the single outgoing edge into the success
 * one, and turning it off hands it back, so wiring already on the canvas
 * survives the switch either way.
 */
const rewire = (
  config: TPolicyConfig,
  nextActionId: string | undefined,
  wasBranching: boolean,
  isBranching: boolean,
) => {
  if (isBranching && !wasBranching) {
    return {
      nextActionId: '',
      config: {
        ...config,
        onSuccessActionId: nextActionId || config.onSuccessActionId || '',
      },
    };
  }

  if (!isBranching && wasBranching) {
    return {
      nextActionId: config.onSuccessActionId || '',
      config: { ...config, onSuccessActionId: '', onErrorActionId: '' },
    };
  }

  return { nextActionId, config: { ...config } };
};

/** An action's retry and on-error policy, read from and written to its config. */
export const useActionErrorPolicy = (
  currentIndex: number,
  currentAction: TAutomationBuilderActions[number],
) => {
  const { actionConstMap } = useAutomation();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const config = (currentAction.config || {}) as TPolicyConfig;
  const policy = readPolicy(config);

  const apply = useCallback(
    (next: Partial<TPolicy>) => {
      const merged = { ...policy, ...next };
      const wired = rewire(
        config,
        currentAction.nextActionId,
        policy.branching,
        merged.branching,
      );

      setAutomationBuilderFormValue(
        `actions.${currentIndex}` as Path<TAutomationBuilderForm>,
        {
          ...currentAction,
          nextActionId: wired.nextActionId,
          config: {
            ...wired.config,
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
    },
    [
      policy,
      config,
      currentAction,
      currentIndex,
      setAutomationBuilderFormValue,
    ],
  );

  return {
    isSupported: supportsErrorPolicy(actionConstMap.get(currentAction.type)),
    policy,
    isRetrying: policy.attempts > 0,
    showDropWarning: policy.branching && !!config.onErrorActionId,
    apply,
  };
};
