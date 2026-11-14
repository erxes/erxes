import type {
  Automation,
  AutomationDefinition,
  AutomationStep,
  coreContract,
} from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { automationQuery } from './automationQueries';

interface Draft {
  name?: string;
  description?: string;
  definition?: AutomationDefinition;
}

/**
 * Unsaved edits over the saved automation. A newer automation from the server
 * (saved, restored, turned on) starts the draft again from it.
 */
export const useAutomationDraft = (automation: Automation) => {
  const [draft, setDraft] = useState<Draft>({});
  const [base, setBase] = useState(automation);

  if (base !== automation) {
    setBase(automation);
    setDraft({});
  }

  const name = draft.name ?? automation.name;
  const description = draft.description ?? automation.description ?? '';
  const definition = draft.definition ?? automation.definition;

  const dirty =
    name !== automation.name ||
    description !== (automation.description ?? '') ||
    JSON.stringify(definition) !== JSON.stringify(automation.definition);

  return {
    name,
    description,
    definition,
    dirty,
    /** What saving sends. */
    input: { id: automation.id, name, description: description || null, definition },
    change: (patch: Draft) => setDraft((current) => ({ ...current, ...patch })),
    setDefinition: (next: AutomationDefinition) =>
      setDraft((current) => ({ ...current, definition: next })),
    setSteps: (steps: AutomationStep[]) =>
      setDraft((current) => ({
        ...current,
        definition: { ...(current.definition ?? automation.definition), steps },
      })),
  };
};

type UpdateInput = InferContractRouterInputs<typeof coreContract>['automations']['update'];

/** Save, turn on, pause, start now and delete; `onProblems` gets what the server refused. */
export const useAutomationMutations = (id: string, onProblems: (problems: string[]) => void) => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const client = useQueryClient();
  const navigate = useNavigate();

  const update = (next: Automation) => {
    client.setQueryData(automationQuery(id).queryKey, next);
    void client.invalidateQueries({ queryKey: orpc.automations.list.key() });
  };

  const onError = (error: Error) => {
    onProblems(isApiError(error, 'INVALID_AUTOMATION') ? error.data.problems : []);
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });
  };

  const save = useMutation(
    orpc.automations.update.mutationOptions({
      onSuccess: (next) => {
        onProblems([]);
        update(next);
        toast({
          title:
            next.status === 'active' ? t('published', 'Saved and published') : t('saved', 'Saved'),
        });
      },
      onError,
    }),
  );

  const activate = useMutation({
    mutationFn: async (input: UpdateInput) => {
      await orpc.automations.update.call(input);

      return orpc.automations.activate.call({ id });
    },
    onSuccess: (next) => {
      onProblems([]);
      update(next);
      toast({ title: t('activated', 'Turned on') });
    },
    onError,
  });

  const pause = useMutation(orpc.automations.pause.mutationOptions({ onSuccess: update, onError }));

  const start = useMutation(
    orpc.automations.start.mutationOptions({
      onSuccess: (result) => {
        toast({
          title: t('started', 'Started for {{started}} records ({{skipped}} skipped)', result),
          description: result.continuing
            ? t('started-continuing', 'The rest of the audience starts in the background.')
            : undefined,
        });
        void client.invalidateQueries({ queryKey: orpc.automations.get.key({ input: { id } }) });
        void client.invalidateQueries({ queryKey: orpc.automations.stats.key({ input: { id } }) });
        void client.invalidateQueries({ queryKey: orpc.automations.runs.key({ input: { id } }) });
      },
      onError,
    }),
  );

  const remove = useMutation(
    orpc.automations.remove.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.automations.list.key() });
        void navigate('/automations');
      },
      onError,
    }),
  );

  return { save, activate, pause, start, remove };
};

export type AutomationMutations = ReturnType<typeof useAutomationMutations>;
