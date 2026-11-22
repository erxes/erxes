import type { Automation } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, Tabs, usePageHotkey } from 'erxes-ui';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { useLeaveWarning } from '~/lib/useLeaveWarning';
import { messageOf } from '@erxes/core-contract/client';
import { useCan, useSession } from '~/modules/auth/session';
import { AutomationHeader } from './AutomationHeader';
import { AutomationInspector } from './AutomationInspector';
import { automationQuery, type Catalog, catalogQuery, runsQuery } from './automationQueries';
import { FlowCanvas } from './builder/FlowCanvas';
import { countSteps } from './builder/flowChecks';
import { insertStep, newStep, removeStep } from './builder/flowModel';
import { describeTrigger } from './builder/flowText';
import { BuilderContext } from './builder/BuilderContext';
import { useBuilder } from './builder/useBuilder';
import { RunsPanel } from './RunsPanel';
import type { Selection } from './StepInspector';
import { useAutomationDraft, useAutomationMutations } from './useAutomationEditor';

/** ⌘S saves; Delete removes the selected step; Escape goes back to the settings. */
const useShortcuts = ({
  onSave,
  onRemove,
  onEscape,
}: {
  onSave: (() => void) | undefined;
  onRemove: (() => void) | undefined;
  onEscape: () => void;
}) => {
  // Saving works from inside a field too.
  useHotkeys('mod+s', () => onSave?.(), {
    preventDefault: true,
    enableOnFormTags: true,
    enableOnContentEditable: true,
  });
  usePageHotkey('escape', onEscape);
  usePageHotkey('delete, backspace', () => onRemove?.());
};

/** The draft, what is selected, the save and start mutations, and the editor's keys. */
const useEditorState = (automation: Automation, editable: boolean) => {
  const draft = useAutomationDraft(automation);
  const [selected, setSelected] = useState<Selection>('settings');
  const [serverProblems, setServerProblems] = useState<string[]>([]);

  const mutations = useAutomationMutations(automation.id, (list) => {
    setServerProblems(list);

    if (list.length) setSelected('settings');
  });

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
            draft.setSteps(removeStep(draft.definition.steps, selected));
            setSelected('settings');
          }
        : undefined,
    onEscape: () => setSelected('settings'),
  });

  return { draft, selected, setSelected, serverProblems, mutations };
};

/** Build and Runs, with the flow's size and how many problems are left. */
const EditorTabBar = ({
  automationId,
  steps,
  problemCount,
  statsError,
}: {
  automationId: string;
  steps: number;
  problemCount: number;
  statsError: Error | null;
}) => {
  const { t } = useTranslation('automations');
  const runs = useQuery(runsQuery(automationId)).data;

  return (
    <div className="flex items-center border-b px-4">
      <Tabs.List variant="flush" className="h-9">
        <Tabs.Trigger value="build">{t('build', 'Build')}</Tabs.Trigger>
        <Tabs.Trigger value="runs">
          {t('runs', 'Runs')}
          {runs && ` (${runs.totalCount}${runs.totalCapped ? '+' : ''})`}
        </Tabs.Trigger>
      </Tabs.List>
      <span className="ml-auto text-xs text-muted-foreground">
        {t('step-count', '{{count}} steps', { count: steps })}
        {problemCount > 0 && (
          <span className="text-destructive-text">
            {' '}
            · {t('problem-count', '{{count}} to fix', { count: problemCount })}
          </span>
        )}
        {statsError && <span className="text-destructive-text"> · {messageOf(statsError)}</span>}
      </span>
    </div>
  );
};

/** The flow on the canvas; "+" adds a step there and selects it. */
const BuildCanvas = ({
  built,
  catalog,
  draft,
  editable,
  selected,
  onSelect,
  zoom,
  onZoom,
}: {
  built: ReturnType<typeof useBuilder>;
  catalog: Catalog;
  draft: ReturnType<typeof useAutomationDraft>;
  editable: boolean;
  selected: Selection;
  onSelect: (selection: Selection) => void;
  zoom: number;
  onZoom: (zoom: number) => void;
}) => {
  const { definition } = draft;
  const { timezone } = useSession().organization;

  return (
    <FlowCanvas
      trigger={{
        kind: definition.trigger.kind,
        ...describeTrigger(definition.trigger, catalog.triggers, built.fields, timezone),
      }}
      steps={definition.steps}
      actions={built.actions}
      fields={built.fields}
      selected={selected}
      problems={built.problems}
      disabled={!editable}
      zoom={zoom}
      onZoom={onZoom}
      onSelect={onSelect}
      onDeselect={() => onSelect('settings')}
      onAdd={(address, index, type) => {
        const step = newStep(type, built.actions, built.subject);

        draft.setSteps(insertStep(definition.steps, address, index, step));
        onSelect(step.id);
      }}
    />
  );
};

const AutomationEditor = ({
  automation,
  catalog,
}: {
  automation: Automation;
  catalog: Catalog;
}) => {
  const editable = useCan()('automations.manage');
  const editor = useEditorState(automation, editable);
  const { draft, selected, setSelected, serverProblems, mutations } = editor;
  const { definition } = draft;
  const [zoom, setZoom] = useState(1);
  const built = useBuilder(catalog, definition, automation.id);
  const { stats, subject, hasSubject, fields, actions, problems } = built;
  const problemCount = [...problems.values()].reduce((sum, list) => sum + list.length, 0);

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
        <EditorTabBar
          automationId={automation.id}
          steps={countSteps(definition.steps)}
          problemCount={problemCount}
          statsError={stats.error}
        />
        <Tabs.Content value="build" className="mt-0 flex min-h-0 flex-1">
          <BuilderContext.Provider value={built.builder}>
            <BuildCanvas
              built={built}
              catalog={catalog}
              draft={draft}
              editable={editable}
              selected={selected}
              onSelect={setSelected}
              zoom={zoom}
              onZoom={setZoom}
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
