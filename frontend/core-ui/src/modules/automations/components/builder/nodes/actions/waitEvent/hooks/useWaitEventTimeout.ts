import {
  TAutomationWaitEventConfig,
  TWaitEventTimeout,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Path, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

const MAX_MINUTES = 30 * 24 * 60;
const UNIT_MINUTES = { minutes: 1, hours: 60, days: 24 * 60 } as const;
const DEFAULT_TIMEOUT: TWaitEventTimeout = { value: 1, unit: 'days' };

/** Why a timeout cannot be saved, or nothing when it fits. */
export const waitEventTimeoutError = (timeout?: TWaitEventTimeout) => {
  if (!timeout) return undefined;
  const amount = Number(timeout.value);
  if (!Number.isFinite(amount) || amount <= 0) return 'positive';
  return amount * UNIT_MINUTES[timeout.unit] > MAX_MINUTES ? 'too-long' : undefined;
};

/**
 * The longest a wait lasts. Turning it on renames the node's single exit into
 * `met` and adds `timedOut`; turning it off hands `met` back as the exit, so
 * wiring already on the canvas survives either way.
 */
export const useWaitEventTimeout = (
  currentAction: TAutomationAction,
  currentActionIndex: number,
) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const actionPath = `actions.${currentActionIndex}` as Path<TAutomationBuilderForm>;
  const action = (useWatch({ control, name: actionPath }) ||
    currentAction) as TAutomationAction<TAutomationWaitEventConfig>;
  const config = (action.config || {}) as TAutomationWaitEventConfig;

  const write = (next: TAutomationAction<TAutomationWaitEventConfig>) =>
    setAutomationBuilderFormValue(
      actionPath,
      next as PathValue<TAutomationBuilderForm, Path<TAutomationBuilderForm>>,
      { shouldValidate: true, shouldDirty: true },
    );

  const setEnabled = (enabled: boolean) => {
    if (enabled === !!config.timeout) return;

    if (enabled) {
      write({
        ...action,
        nextActionId: '',
        config: {
          ...config,
          timeout: DEFAULT_TIMEOUT,
          met: action.nextActionId || config.met || '',
          timedOut: config.timedOut || '',
        },
      });
      return;
    }

    write({
      ...action,
      nextActionId: config.met || '',
      config: { ...config, timeout: undefined, met: '', timedOut: '' },
    });
  };

  const updateTimeout = (timeout: TWaitEventTimeout) =>
    write({ ...action, config: { ...config, timeout } });

  return {
    timeout: config.timeout,
    enabled: !!config.timeout,
    error: waitEventTimeoutError(config.timeout),
    setEnabled,
    updateTimeout,
  };
};
