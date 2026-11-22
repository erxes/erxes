import { paths } from '~/lib/paths';
import type { Automation, AutomationStep, coreContract } from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AutomationDefinition } from '@erxes/core-contract/values';
import { storedFamily, useToast } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { useEffect } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { automationQuery } from './automationQueries';

const StoredDraft = z.object({
  /** The saved automation the edits were made over (`fingerprint` of its content). */
  base: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  definition: AutomationDefinition.optional(),
});

type StoredDraft = z.infer<typeof StoredDraft>;

type Patch = Partial<Omit<StoredDraft, 'base'>>;

/**
 * Unsaved edits, one per automation, kept in this browser: a reload or a closed tab loses
 * nothing, and other tabs follow through the browser's storage event. Written on each edit,
 * removed once it matches what is saved.
 */
const draftState = storedFamily<StoredDraft | null>({
  key: 'erxes:automations:draft',
  schema: StoredDraft.nullable(),
  initial: null,
});

const contentOf = (draft: { name: string; description: string; definition: unknown }) =>
  JSON.stringify([draft.name, draft.description, draft.definition]);

/** A short FNV-1a hash, enough to tell one saved version from another. */
const fingerprint = (text: string) => {
  let hash = 0x81_1c_9d_c5;

  for (let index = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01_00_01_93);
  }

  return (hash >>> 0).toString(36);
};

/**
 * Unsaved edits over the saved automation, kept in the browser. Edits made over a version
 * that has since changed on the server (someone else saved) are `stale`: they wait until
 * the member restores them over the new version or drops them; editing starts afresh.
 * Turning on, pausing or new stats leave the content, and so the edits, as they are.
 */
export const useAutomationDraft = (automation: Automation) => {
  const [stored, setStored] = useAtom(draftState(automation.id));
  const savedDescription = automation.description ?? '';
  const saved = contentOf({ ...automation, description: savedDescription });
  const base = fingerprint(saved);
  const fresh = stored?.base === base ? stored : null;

  const merged = (draft: StoredDraft | null) => ({
    name: draft?.name ?? automation.name,
    description: draft?.description ?? savedDescription,
    definition: draft?.definition ?? automation.definition,
  });

  const { name, description, definition } = merged(fresh);
  const dirty = contentOf({ name, description, definition }) !== saved;
  const storedContent = stored ? contentOf(merged(stored)) : null;
  const stale = stored && !fresh && storedContent !== saved ? stored : null;

  useEffect(() => {
    if (storedContent === saved) setStored(RESET);
  }, [storedContent, saved, setStored]);

  const edit = (patch: (current: StoredDraft | null) => Patch) =>
    setStored((previous) => {
      const current = previous?.base === base ? previous : null;

      return { ...current, ...patch(current), base };
    });

  return {
    name,
    description,
    definition,
    dirty,
    /** Edits over an older saved version, waiting for `restore` or `drop`. */
    stale: stale !== null,
    restore: () => setStored((previous) => (previous ? { ...previous, base } : previous)),
    drop: () => setStored(RESET),
    /** What saving sends. */
    input: { id: automation.id, name, description: description || null, definition },
    change: (patch: Patch) => edit(() => patch),
    setDefinition: (next: AutomationDefinition) => edit(() => ({ definition: next })),
    setSteps: (steps: AutomationStep[]) =>
      edit((current) => ({
        definition: { ...(current?.definition ?? automation.definition), steps },
      })),
  };
};

type UpdateInput = InferContractRouterInputs<typeof coreContract>['automations']['update'];

const savedBase = (automation: Automation) =>
  fingerprint(contentOf({ ...automation, description: automation.description ?? '' }));

/**
 * After a save: the kept edits are gone when they are what was sent; edits made while it was
 * saving stay, over the version just saved.
 */
const useSettleDraft = (id: string) => {
  const setStored = useSetAtom(draftState(id));

  return (sent: UpdateInput, next: Automation) =>
    setStored((previous) => {
      if (!previous) return previous;

      const unchanged =
        (previous.name ?? sent.name) === sent.name &&
        (previous.description ?? sent.description ?? '') === (sent.description ?? '') &&
        JSON.stringify(previous.definition ?? sent.definition) === JSON.stringify(sent.definition);

      return unchanged ? RESET : { ...previous, base: savedBase(next) };
    });
};

/** Save, turn on, pause, start now and delete; `onProblems` gets what the server refused. */
export const useAutomationMutations = (id: string, onProblems: (problems: string[]) => void) => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const client = useQueryClient();
  const navigate = useNavigate();
  const settleDraft = useSettleDraft(id);

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
      onSuccess: (next, sent) => {
        onProblems([]);
        settleDraft(sent, next);
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
    onSuccess: (next, sent) => {
      onProblems([]);
      settleDraft(sent, next);
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
        void navigate(paths.automations.list);
      },
      onError,
    }),
  );

  return { save, activate, pause, start, remove };
};

export type AutomationMutations = ReturnType<typeof useAutomationMutations>;
