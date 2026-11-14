import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { filterActionsForTargets } from '@/automations/utils/targetTypeCompat';
import { useBroadcastTemplates } from '@/broadcast/components/workflow/hooks/useBroadcastTemplates';
import { useCallback, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { IAutomationsActionConfigConstants } from 'ui-modules';

/** What a broadcast hands each run. Actions are matched against this. */
export const BROADCAST_TARGET_TYPE = 'core:contacts.customers';

/**
 * A flow whose only step is one email is the email campaign type wearing a
 * different hat. Behind another action it earns its place, so it appears
 * once the flow has a step.
 */
const NOT_FIRST_STEP_ACTION_TYPES = ['sendEmail'];

/**
 * The campaign's step library. A whole-flow template only makes sense on an
 * empty flow; asked to put something after a chosen step, the answer is a
 * step, so that tab opens first.
 */
export const useBroadcastNodeLibrary = () => {
  const { actionsConst, loading, error, refetch, onSelectNode } =
    useAutomationNodeLibrarySidebar();
  const { awaitingToConnectNodeId } = useAutomation();
  const { templates } = useBroadcastTemplates();
  const [openTemplate, setOpenTemplate] = useState<TBuiltInTemplate | null>(
    null,
  );
  const actions = useWatch<TAutomationBuilderForm>({ name: 'actions' }) as
    | TAutomationBuilderForm['actions']
    | undefined;
  const hasSteps = !!actions?.length;

  const stepOptions = useMemo(
    () =>
      filterActionsForTargets(actionsConst || [], [BROADCAST_TARGET_TYPE])
        .filter(
          ({ type }) => hasSteps || !NOT_FIRST_STEP_ACTION_TYPES.includes(type),
        )
        .map((item: IAutomationsActionConfigConstants) => ({
          item,
          select: () =>
            onSelectNode({
              nodeType: AutomationNodeType.Action,
              type: item.type,
              label: item.label,
              icon: item.icon || '',
              description: item.description || '',
            }),
        })),
    [actionsConst, hasSteps, onSelectNode],
  );

  const onTemplateDialogChange = useCallback((open: boolean) => {
    if (!open) {
      setOpenTemplate(null);
    }
  }, []);

  return {
    loading,
    error,
    refetch,
    templates,
    stepOptions,
    openTemplate,
    chooseTemplate: setOpenTemplate,
    onTemplateDialogChange,
    offersTemplates: !hasSteps && !!templates.length,
    defaultTab: awaitingToConnectNodeId ? 'steps' : 'templates',
    hintKey: awaitingToConnectNodeId
      ? 'workflow.after-selected'
      : 'workflow.each-step',
  };
};
