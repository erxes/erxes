import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import {
  materializeBuiltInTemplate,
  TBuiltInTemplate,
} from '@/automations/utils/builtInTemplates';
import { filterActionsForTargets } from '@/automations/utils/targetTypeCompat';
import { BROADCAST_TARGET_TYPE } from '@/broadcast/components/workflow/BroadcastNodeLibrary';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * The built-in templates a campaign can actually run.
 *
 * A template naming an action this deployment does not have — its plugin is
 * not installed — is dropped rather than offered and then broken, and so is
 * one built around a record type a campaign never hands out.
 */
export const useBroadcastTemplates = () => {
  const { workflowTemplatesConst, actionsConst, loading } = useAutomation();

  const templates = useMemo(() => {
    const available = new Set(
      filterActionsForTargets(actionsConst || [], [BROADCAST_TARGET_TYPE]).map(
        ({ type }) => type,
      ),
    );

    return (workflowTemplatesConst || []).filter((template) =>
      (template.flow || []).every(({ type }) => available.has(type)),
    );
  }, [workflowTemplatesConst, actionsConst]);

  return { templates, loading };
};

/** Writes a materialized template into the campaign's flow. */
export const useInstallBroadcastTemplate = () => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getValues } = useFormContext<TAutomationBuilderForm>();

  const installTemplate = (
    template: TBuiltInTemplate,
    answers: Record<string, unknown>,
  ) => {
    const triggers = getValues('triggers') || [];
    const actions = getValues('actions') || [];

    const { actions: installed, entryActionId } = materializeBuiltInTemplate(
      template,
      {
        usedIds: [...triggers, ...actions].map(({ id }) => id),
        answers,
      },
    );

    setAutomationBuilderFormValue('actions', [...actions, ...installed]);

    // Only claims the start node when nothing was there: installing a second
    // template must not silently re-point the flow's beginning.
    if (!triggers[0]?.actionId && entryActionId) {
      setAutomationBuilderFormValue(
        'triggers',
        triggers.map((trigger, index) =>
          index === 0 ? { ...trigger, actionId: entryActionId } : trigger,
        ),
      );
    }

    return entryActionId;
  };

  return { installTemplate };
};
