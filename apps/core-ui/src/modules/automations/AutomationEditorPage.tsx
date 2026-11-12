import type { Automation, AutomationDefinition } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, Tabs } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { AutomationHeader } from './AutomationHeader';
import { AutomationInspector } from './AutomationInspector';
import { automationQuery, type Catalog, catalogQuery } from './automationQueries';
import { FlowCanvas } from './builder/FlowCanvas';
import {
  countSteps,
  describeTrigger,
  flowProblems,
  insertStep,
  newStep,
  removeStep,
  stepOutputFields,
} from './builder/flowModel';
import { BuilderContext } from './builder/BuilderContext';
import { useAutomationFields } from './builder/useAutomationFields';
import { RunsPanel } from './RunsPanel';
import type { Selection } from './StepInspector';
import { useAutomationDraft, useAutomationMutations } from './useAutomationEditor';

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('[role="dialog"],[role="menu"],[role="listbox"]'));

/** The record type runs are about, and whether the trigger gives one at all. */
const subjectOf = (trigger: AutomationDefinition['trigger'], triggers: Catalog['triggers']) => {
  if (trigger.kind === 'event') {
    const event = triggers.find((item) => item.type === trigger.event);

    return { subject: event?.subject ?? 'customer', hasSubject: Boolean(event?.subject) };
  }

  if (trigger.kind === 'date') return { subject: trigger.subject, hasSubject: true };

  const audience = 'audience' in trigger ? trigger.audience : undefined;

  return { subject: audience?.type ?? 'customer', hasSubject: Boolean(audience) };
};

/** Leaving with unsaved changes asks first. */
const useLeaveWarning = (dirty: boolean) =>
  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

/** ⌘S saves; Delete removes the selected step; Escape goes back to the settings. */
const useShortcuts = ({
  onSave,
  onRemove,
  onEscape,
}: {
  onSave: (() => void) | undefined;
  onRemove: (() => void) | undefined;
  onEscape: () => void;
}) =>
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onSave?.();

        return;
      }

      if (typing(event.target)) return;

      if (event.key === 'Escape') onEscape();

      if (event.key === 'Delete' || event.key === 'Backspace') onRemove?.();
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [onSave, onRemove, onEscape]);

/**
 * The builder's derived data: actions for this subject, each step's problems,
 * and what the builder parts share (events, per-step stats, earlier outputs).
 */
const useBuilder = (catalog: Catalog, definition: AutomationDefinition, automationId: string) => {
  const stats = useQuery(
    orpc.automations.stats.queryOptions({ input: { id: automationId }, refetchInterval: 15_000 }),
  );

  const { subject, hasSubject } = subjectOf(definition.trigger, catalog.triggers);
  const { fields, error: fieldsError } = useAutomationFields(hasSubject ? subject : null);

  const actions = useMemo(
    () =>
      catalog.actions.filter(
        (action) =>
          !action.subject ||
          (hasSubject && (action.subject === 'any' || action.subject === subject)),
      ),
    [catalog.actions, hasSubject, subject],
  );

  const problems = useMemo(() => flowProblems(definition.steps, actions), [definition, actions]);

  const builder = useMemo(() => {
    const events = catalog.triggers.filter((item) => item.subject);

    return {
      events,
      stats: new Map((stats.data?.steps ?? []).map((step) => [step.stepId, step])),
      outputsBefore: (stepId: string) => stepOutputFields(definition.steps, stepId, { events }),
    };
  }, [catalog.triggers, stats.data, definition]);

  return { stats, subject, hasSubject, fields, fieldsError, actions, problems, builder };
};

const AutomationEditor = ({
  automation,
  catalog,
}: {
  automation: Automation;
  catalog: Catalog;
}) => {
  const { t } = useTranslation('automations');
  const editable = useCan()('automations.manage');
  const draft = useAutomationDraft(automation);
  const { definition } = draft;
  const [selected, setSelected] = useState<Selection>('settings');
  const [zoom, setZoom] = useState(1);
  const [serverProblems, setServerProblems] = useState<string[]>([]);

  const mutations = useAutomationMutations(automation.id, (list) => {
    setServerProblems(list);

    if (list.length) setSelected('settings');
  });

  const built = useBuilder(catalog, definition, automation.id);
  const { stats, subject, hasSubject, fields, actions, problems } = built;
  const problemCount = [...problems.values()].reduce((sum, list) => sum + list.length, 0);
  const stepSelected = selected !== 'settings' && selected !== 'trigger';

  useLeaveWarning(draft.dirty);
  useShortcuts({
    onSave:
      editable && draft.dirty && !mutations.save.isPending
        ? () => mutations.save.mutate(draft.input)
        : undefined,
    onRemove:
      editable && stepSelected
        ? () => {
            draft.setSteps(removeStep(definition.steps, selected));
            setSelected('settings');
          }
        : undefined,
    onEscape: () => setSelected('settings'),
  });

  return (
    <PageContainer>
      <AutomationHeader
        automation={automation}
        draft={draft}
        mutations={mutations}
        subject={hasSubject ? subject : null}
        problemCount={problemCount}
        editable={editable}
      />
      <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center border-b px-4">
          <Tabs.List className="h-9 border-b-0">
            <Tabs.Trigger value="build">{t('build', 'Build')}</Tabs.Trigger>
            <Tabs.Trigger value="runs">
              {t('runs', 'Runs')} (
              {stats.data?.runs.total ??
                automation.stats.running + automation.stats.succeeded + automation.stats.failed}
              )
            </Tabs.Trigger>
          </Tabs.List>
          <span className="ml-auto text-xs text-muted-foreground">
            {t('step-count', '{{count}} steps', { count: countSteps(definition.steps) })}
            {problemCount > 0 && (
              <span className="text-destructive">
                {' '}
                · {t('problem-count', '{{count}} to fix', { count: problemCount })}
              </span>
            )}
            {stats.error && <span className="text-destructive"> · {messageOf(stats.error)}</span>}
          </span>
        </div>
        <Tabs.Content value="build" className="mt-0 flex min-h-0 flex-1">
          <BuilderContext.Provider value={built.builder}>
            <FlowCanvas
              trigger={{
                kind: definition.trigger.kind,
                ...describeTrigger(definition.trigger, catalog.triggers, fields),
              }}
              steps={definition.steps}
              actions={actions}
              fields={fields}
              selected={selected}
              problems={problems}
              disabled={!editable}
              zoom={zoom}
              onZoom={setZoom}
              onSelect={setSelected}
              onDeselect={() => setSelected('settings')}
              onAdd={(address, index, type) => {
                const step = newStep(type, actions, subject);

                draft.setSteps(insertStep(definition.steps, address, index, step));
                setSelected(step.id);
              }}
            />
            <AutomationInspector
              automation={automation}
              draft={draft}
              catalog={catalog}
              actions={actions}
              fields={fields}
              fieldsError={built.fieldsError}
              subject={subject}
              hasSubject={hasSubject}
              editable={editable}
              problems={problems}
              serverProblems={serverProblems}
              skippedByLimit={stats.data?.skippedByLimit ?? 0}
              selected={selected}
              onSelect={setSelected}
              onStartNow={
                automation.status === 'active' && editable
                  ? () => mutations.start.mutate({ id: automation.id })
                  : undefined
              }
            />
          </BuilderContext.Provider>
        </Tabs.Content>
        <Tabs.Content value="runs" className="mt-0 flex min-h-0 flex-1">
          <RunsPanel automationId={automation.id} />
        </Tabs.Content>
      </Tabs>
    </PageContainer>
  );
};

/**
 * One automation: a flow canvas (trigger, steps, branches) with an inspector
 * for whatever is selected, and its runs. Saving an active automation
 * publishes a new version at once (runs in progress keep theirs).
 */
export const AutomationEditorPage = () => {
  const { id = '' } = useParams();
  const automation = useQuery(automationQuery(id));
  const catalog = useQuery(catalogQuery());

  return (
    <QueryState query={automation} className="py-12">
      {(loaded) => (
        <QueryState query={catalog} className="py-12">
          {(triggersAndActions) => (
            <AutomationEditor automation={loaded} catalog={triggersAndActions} />
          )}
        </QueryState>
      )}
    </QueryState>
  );
};
