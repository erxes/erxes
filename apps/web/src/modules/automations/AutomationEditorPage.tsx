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
import { SettingsDialog } from './AutomationSettings';
import { automationQuery, type Catalog, catalogQuery, runsQuery } from './automationQueries';
import { BuilderContext } from './builder/BuilderContext';
import { FlowCanvas } from './builder/FlowCanvas';
import { insertStep, newStep, removeStep } from './builder/flowModel';
import { useBuilder } from './builder/useBuilder';
import { useTriggerText } from './builder/useStepText';
import { ProblemsPopover } from './ProblemsPopover';
import { RunsPanel } from './RunsPanel';
import type { Selection } from './StepInspector';
import { useAutomationDraft, useAutomationMutations } from './useAutomationEditor';
import { useFlowGuard } from './useFlowGuard';

const isStep = (selection: Selection) => selection !== 'trigger' && selection !== 'test';

/** The draft, what is selected, the save and start mutations, and the editor's keys. */
const useEditorState = (automation: Automation, editable: boolean, catalog: Catalog) => {
  const draft = useFlowGuard(useAutomationDraft(automation), catalog);
  const [selected, setSelected] = useState<Selection>('trigger');
  const [serverProblems, setServerProblems] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mutations = useAutomationMutations(automation.id, setServerProblems);

  useLeaveWarning(draft.dirty, { kept: true });
  useHotkeys(
    'mod+s',
    () => {
      if (editable && draft.dirty && !mutations.save.isPending) mutations.save.mutate(draft.input);
    },
    { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true },
  );
  usePageHotkey('escape', () => setSelected('trigger'));
  usePageHotkey('delete, backspace', () => {
    if (!editable || !isStep(selected)) return;

    draft.setSteps(removeStep(draft.definition.steps, selected));
    setSelected('trigger');
  });

  return {
    draft,
    selected,
    setSelected,
    serverProblems,
    mutations,
    settings: { open: settingsOpen, setOpen: setSettingsOpen },
  };
};

const EditorTabBar = ({
  automationId,
  children,
  statsError,
}: {
  automationId: string;
  children: React.ReactNode;
  statsError: Error | null;
}) => {
  const { t } = useTranslation('automations');
  const runs = useQuery(runsQuery(automationId)).data;

  return (
    <div className="flex items-center gap-2 border-b px-4">
      <Tabs.List variant="flush" className="h-9">
        <Tabs.Trigger value="build">{t('build', 'Build')}</Tabs.Trigger>
        <Tabs.Trigger value="runs">
          {t('runs', 'Runs')}
          {runs && ` (${runs.totalCount}${runs.totalCapped ? '+' : ''})`}
        </Tabs.Trigger>
      </Tabs.List>
      <span className="ml-auto" />
      {statsError && <span className="text-xs text-destructive-text">{messageOf(statsError)}</span>}
      {children}
    </div>
  );
};

const BuildCanvas = ({
  built,
  draft,
  trigger,
  editable,
  selected,
  onSelect,
}: {
  built: ReturnType<typeof useBuilder>;
  draft: ReturnType<typeof useAutomationDraft>;
  trigger: ReturnType<typeof useTriggerText>;
  editable: boolean;
  selected: Selection;
  onSelect: (selection: Selection) => void;
}) => {
  const [zoom, setZoom] = useState(1);
  const { definition } = draft;

  return (
    <FlowCanvas
      trigger={{ kind: definition.trigger.kind, ...trigger }}
      steps={definition.steps}
      actions={built.actions}
      selected={selected}
      problems={built.problems}
      disabled={!editable}
      zoom={zoom}
      onZoom={setZoom}
      onSelect={onSelect}
      onDeselect={() => onSelect('trigger')}
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
  const editor = useEditorState(automation, editable, catalog);
  const { draft, selected, setSelected, mutations } = editor;
  const { definition } = draft;
  const { timezone } = useSession().organization;
  const built = useBuilder(catalog, definition, automation.id);
  const problemCount = [...built.problems.values()].reduce((sum, list) => sum + list.length, 0);

  const trigger = useTriggerText(
    definition.trigger,
    catalog.triggers,
    built.fields,
    built.builder.subject,
    timezone,
  );

  return (
    <PageContainer>
      <AutomationHeader
        automation={automation}
        draft={draft}
        mutations={mutations}
        problemCount={problemCount}
        editable={editable}
        onTest={() => setSelected('test')}
        onSettings={() => editor.settings.setOpen(true)}
      />
      <BuilderContext.Provider value={built.builder}>
        <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col">
          <EditorTabBar automationId={automation.id} statsError={built.stats.error}>
            <ProblemsPopover
              steps={definition.steps}
              problems={built.problems}
              serverProblems={editor.serverProblems}
              onSelect={setSelected}
            />
          </EditorTabBar>
          <Tabs.Content value="build" className="mt-0 flex min-h-0 flex-1">
            <BuildCanvas
              built={built}
              draft={draft}
              trigger={trigger}
              editable={editable}
              selected={selected}
              onSelect={setSelected}
            />
            <AutomationInspector
              automation={automation}
              draft={draft}
              mutations={mutations}
              catalog={catalog}
              built={built}
              editable={editable}
              selected={selected}
              onSelect={setSelected}
            />
          </Tabs.Content>
          <Tabs.Content value="runs" className="mt-0 flex min-h-0 flex-1">
            <RunsPanel automationId={automation.id} />
          </Tabs.Content>
        </Tabs>
      </BuilderContext.Provider>
      <SettingsDialog
        open={editor.settings.open}
        onOpenChange={editor.settings.setOpen}
        draft={draft}
        editable={editable}
        built={built}
      />
    </PageContainer>
  );
};

/**
 * One automation: the flow canvas (trigger, steps, branches) with
 * a panel for whatever is selected or the test, and its runs. Saving an active automation
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
