import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { filterActionsForTargets } from '@/automations/utils/targetTypeCompat';
import { BROADCAST_TARGET_TYPE } from '@/broadcast/components/workflow/hooks/useBroadcastNodeLibrary';
import { AUTOMATION_BUILT_IN_TEMPLATE_MATERIALIZE } from '@/broadcast/components/workflow/graphql/builtInTemplateQueries';
import { useApolloClient, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

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

export type TMaterializedBuiltInTemplate = {
  actions: TAutomationAction[];
  entryActionId?: string;
  unanswered: string[];
};

const toVariables = (
  template: TBuiltInTemplate,
  answers: Record<string, unknown>,
  usedIds: string[] = [],
) => ({
  pluginName: template.pluginName || 'core',
  templateId: template.id,
  answers,
  usedIds,
});

/**
 * What the template becomes with these answers, built by the server that also
 * installs it, so the preview cannot differ from the install.
 */
export const useBuiltInTemplatePreview = (
  template: TBuiltInTemplate | null,
  answers: Record<string, unknown>,
) => {
  const { data, previousData, loading, error } = useQuery<{
    automationBuiltInTemplateMaterialize: TMaterializedBuiltInTemplate;
  }>(AUTOMATION_BUILT_IN_TEMPLATE_MATERIALIZE, {
    variables: template ? toVariables(template, answers) : undefined,
    skip: !template,
  });

  // The last preview stays drawn while the next answer is applied
  const preview = (data || previousData)?.automationBuiltInTemplateMaterialize;

  return { preview, loading, error };
};

/** Writes a materialized template into the campaign's flow. */
export const useInstallBroadcastTemplate = () => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const client = useApolloClient();
  const [installing, setInstalling] = useState(false);

  const installTemplate = async (
    template: TBuiltInTemplate,
    answers: Record<string, unknown>,
  ) => {
    const triggers = getValues('triggers') || [];
    const actions = getValues('actions') || [];

    setInstalling(true);

    try {
      const { data } = await client.query<{
        automationBuiltInTemplateMaterialize: TMaterializedBuiltInTemplate;
      }>({
        query: AUTOMATION_BUILT_IN_TEMPLATE_MATERIALIZE,
        variables: toVariables(
          template,
          answers,
          [...triggers, ...actions].map(({ id }) => id),
        ),
        fetchPolicy: 'network-only',
      });
      const {
        actions: installed,
        entryActionId,
        unanswered,
      } = data.automationBuiltInTemplateMaterialize;

      if (unanswered.length) {
        throw new Error('Answer every step first');
      }

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
    } finally {
      setInstalling(false);
    }
  };

  return { installTemplate, installing };
};
