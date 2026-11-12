import type { ActionInfo, Automation, AutomationDefinition, AutomationStep } from '@erxes/core-contract';
import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconBolt,
  IconCopy,
  IconDeviceFloppy,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, cn, Input, Label, PageContainer, Select, Spinner, Tabs, Textarea, useConfirm, useToast } from 'erxes-ui';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, isApiError, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { ConditionsEditor } from './builder/ConditionsEditor';
import { FlowCanvas } from './builder/FlowCanvas';
import {
  cloneStep,
  countSteps,
  describeStep,
  describeTrigger,
  findStep,
  flowProblems,
  insertStep,
  locate,
  moveStep,
  newStep,
  removeStep,
  replaceStep,
  STEP_TITLES,
  stepOutputFields,
} from './builder/flowModel';
import { BuilderContext, StepSettings } from './builder/StepSettings';
import { TriggerEditor } from './builder/TriggerEditor';
import { useAutomationFields } from './builder/useAutomationFields';
import { RunsPanel } from './RunsPanel';
import { TestPanel } from './TestPanel';
import { VersionsPanel } from './VersionsPanel';

type Selection = 'settings' | 'trigger' | string;

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.closest('[role="dialog"],[role="menu"],[role="listbox"]'));

/** The inspector's panel for one step: its settings, what's wrong, and moving or removing it. */
const StepInspector = ({
  step,
  actions,
  subject,
  disabled,
  problems,
  steps,
  onChange,
  onSteps,
  onSelect,
}: {
  step: AutomationStep;
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled: boolean;
  problems: string[];
  steps: AutomationStep[];
  onChange: (step: AutomationStep) => void;
  onSteps: (steps: AutomationStep[]) => void;
  onSelect: (selection: Selection) => void;
}) => {
  const { t } = useTranslation('automations');
  const { events, stats, outputsBefore } = useContext(BuilderContext);
  const fields = useAutomationFields(subject);
  const place = locate(steps, step.id);
  const counts = stats.get(step.id);
  const { title } = describeStep(step, { actions, events, fields: [...fields, ...outputsBefore(step.id)] });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t(`step-type.${step.type}`, STEP_TITLES[step.type])}</p>
          <h2 className="text-base font-semibold break-words">{title}</h2>
        </div>
        {!disabled && (
          <div className="flex shrink-0 gap-0.5">
            <Button size="icon" variant="ghost" aria-label={t('move-up', 'Move up')} disabled={!place || place.index === 0} onClick={() => onSteps(moveStep(steps, step.id, -1))}>
              <IconArrowUp />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('move-down', 'Move down')}
              disabled={!place || place.index === place.length - 1}
              onClick={() => onSteps(moveStep(steps, step.id, 1))}
            >
              <IconArrowDown />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('duplicate', 'Duplicate')}
              onClick={() => {
                if (!place) return;

                const copy = cloneStep(step);

                onSteps(insertStep(steps, place.address, place.index + 1, copy));
                onSelect(copy.id);
              }}
            >
              <IconCopy />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              aria-label={t('remove-step', 'Remove step')}
              onClick={() => {
                onSteps(removeStep(steps, step.id));
                onSelect('settings');
              }}
            >
              <IconTrash />
            </Button>
          </div>
        )}
      </div>
      {counts && (
        <p className="text-xs text-muted-foreground">
          {t('step-stats', 'Last 30 days: {{succeeded}} done, {{failed}} failed', counts)}
        </p>
      )}
      {problems.length > 0 && (
        <ul className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {problems.map((problem) => (
            <li key={problem} className="flex items-center gap-2">
              <IconAlertTriangle className="size-4 shrink-0" />
              {problem}
            </li>
          ))}
        </ul>
      )}
      <StepSettings step={step} actions={actions} subject={subject} disabled={disabled} onChange={onChange} />
    </div>
  );
};

/**
 * One automation: a flow canvas (trigger, steps, branches) with an inspector
 * for whatever is selected, and its runs. Saving an active automation
 * publishes a new version at once (runs in progress keep theirs).
 */
export const AutomationEditorPage = () => {
  const { id = '' } = useParams();
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const client = useQueryClient();
  const can = useCan();
  const editable = can('automations.manage');
  const { data: automation, isLoading } = useQuery({ queryKey: ['automations', id], queryFn: () => api.automations.get({ id }) });
  const catalog = useQuery({ queryKey: ['automations', 'catalog'], queryFn: () => api.automations.catalog(), staleTime: 60_000 });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [definition, setDefinition] = useState<AutomationDefinition | null>(null);
  const [serverProblems, setServerProblems] = useState<string[]>([]);
  const [selected, setSelected] = useState<Selection>('settings');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!automation) return;

    setName(automation.name);
    setDescription(automation.description ?? '');
    setDefinition(automation.definition);
  }, [automation]);

  const dirty =
    !!automation &&
    !!definition &&
    (name !== automation.name || description !== (automation.description ?? '') || JSON.stringify(definition) !== JSON.stringify(automation.definition));

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const refresh = (next: Automation) => {
    client.setQueryData(['automations', id], next);
    void client.invalidateQueries({ queryKey: ['automations', 'list'] });
  };
  const onError = (error: unknown) => {
    const list = isApiError(error, 'INVALID_AUTOMATION') ? ((error.data as { problems?: string[] })?.problems ?? []) : [];

    setServerProblems(list);
    if (list.length) setSelected('settings');
    toast({ variant: 'destructive', title: t('failed', 'Something went wrong'), description: messageOf(error) });
  };
  const save = useMutation({
    mutationFn: () => api.automations.update({ id, name, description: description || null, definition: definition! }),
    onSuccess: (next) => {
      setServerProblems([]);
      refresh(next);
      toast({ title: next.status === 'active' ? t('published', 'Saved and published') : t('saved', 'Saved') });
    },
    onError,
  });
  const activate = useMutation({
    mutationFn: async () => {
      await api.automations.update({ id, name, description: description || null, definition: definition! });

      return api.automations.activate({ id });
    },
    onSuccess: (next) => {
      setServerProblems([]);
      refresh(next);
      toast({ title: t('activated', 'Turned on') });
    },
    onError,
  });
  const pause = useMutation({ mutationFn: () => api.automations.pause({ id }), onSuccess: refresh, onError });
  const stats = useQuery({ queryKey: ['automations', id, 'stats'], queryFn: () => api.automations.stats({ id }), refetchInterval: 15_000 });
  const start = useMutation({
    mutationFn: () => api.automations.start({ id }),
    onSuccess: (result) => {
      toast({ title: t('started', 'Started for {{started}} records ({{skipped}} skipped)', result) });
      void client.invalidateQueries({ queryKey: ['automations', id] });
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: () => api.automations.remove({ id }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['automations', 'list'] });
      navigate('/automations');
    },
    onError,
  });

  const triggerDef = definition?.trigger;
  const triggers = catalog.data?.triggers ?? [];
  const eventInfo = triggerDef?.kind === 'event' ? triggers.find((item) => item.type === triggerDef.event) : undefined;
  const subject: 'customer' | 'company' =
    triggerDef?.kind === 'event' ? (eventInfo?.subject ?? 'customer') : triggerDef?.kind === 'date' ? triggerDef.subject : (triggerDef?.audience?.type ?? 'customer');
  const hasSubject = triggerDef?.kind === 'event' ? Boolean(eventInfo?.subject) : triggerDef?.kind === 'date' || Boolean(triggerDef && 'audience' in triggerDef && triggerDef.audience);
  const fields = useAutomationFields(hasSubject ? subject : null);
  const actions = useMemo(
    () => (catalog.data?.actions ?? []).filter((action) => !action.subject || (hasSubject && (action.subject === 'any' || action.subject === subject))),
    [catalog.data, hasSubject, subject],
  );
  const problems = useMemo(() => (definition ? flowProblems(definition.steps, actions) : new Map<string, string[]>()), [definition, actions]);
  const builder = useMemo(
    () => {
      const events = triggers.filter((item) => item.subject);

      return {
        events,
        stats: new Map((stats.data?.steps ?? []).map((step) => [step.stepId, step])),
        outputsBefore: (stepId: string) => (definition ? stepOutputFields(definition.steps, stepId, { events }) : []),
      };
    },
    [triggers, stats.data, definition],
  );


  const setSteps = useCallback((steps: AutomationStep[]) => setDefinition((current) => (current ? { ...current, steps } : current)), []);

  // ⌘S saves; Delete removes the selected step; Escape goes back to the settings.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (editable && dirty && !save.isPending) save.mutate();
        return;
      }

      if (typing(event.target)) return;

      if (event.key === 'Escape') setSelected('settings');
      if ((event.key === 'Delete' || event.key === 'Backspace') && editable && definition && selected !== 'settings' && selected !== 'trigger') {
        setSteps(removeStep(definition.steps, selected));
        setSelected('settings');
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [editable, dirty, save, definition, selected, setSteps]);

  if (isLoading || !automation || !definition || !catalog.data) return <Spinner containerClassName="py-12" />;

  const trigger = describeTrigger(definition.trigger, triggers, fields);
  const selectedStep = selected !== 'settings' && selected !== 'trigger' ? findStep(definition.steps, selected) : null;
  const totalProblems = [...problems.values()].reduce((sum, list) => sum + list.length, 0);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Automations'), to: '/automations', icon: IconBolt },
              { label: name || automation.name, to: `/automations/${id}` },
            ]}
          />
          <Badge variant={automation.status === 'active' ? 'success' : automation.status === 'paused' ? 'warning' : 'secondary'}>
            {t(`automation-status.${automation.status}`, automation.status)}
            {automation.activeVersion ? ` · v${automation.activeVersion}` : ''}
          </Badge>
          {dirty && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-warning" />
              {t('unsaved', 'Unsaved changes')}
            </span>
          )}
        </PageHeader.Start>
        {editable && (
          <PageHeader.End>
            <VersionsPanel automationId={id} active={automation.activeVersion} />
            <TestPanel automationId={id} subject={hasSubject ? subject : null} />
            <Button
              variant="ghost"
              aria-label={t('delete', 'Delete')}
              disabled={remove.isPending}
              onClick={() =>
                void confirm({ message: t('delete-confirm', 'Delete “{{name}}”? Runs in progress stop.', { name: automation.name }) }).then(() => remove.mutate())
              }
            >
              <IconTrash />
            </Button>
            <Button variant="outline" disabled={save.isPending || !dirty} onClick={() => save.mutate()} title="⌘S">
              <IconDeviceFloppy />
              {automation.status === 'active' ? t('publish', 'Save and publish') : t('save', 'Save')}
            </Button>
            {automation.status === 'active' ? (
              <Button variant="outline" disabled={pause.isPending} onClick={() => pause.mutate()}>
                <IconPlayerPause />
                {t('pause', 'Pause')}
              </Button>
            ) : (
              <Button disabled={activate.isPending || totalProblems > 0} title={totalProblems ? t('fix-first', 'Fix the marked steps first') : undefined} onClick={() => activate.mutate()}>
                <IconPlayerPlay />
                {t('activate', 'Turn on')}
              </Button>
            )}
          </PageHeader.End>
        )}
      </PageHeader>
      <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center border-b px-4">
          <Tabs.List className="h-9 border-b-0">
            <Tabs.Trigger value="build">{t('build', 'Build')}</Tabs.Trigger>
            <Tabs.Trigger value="runs">
              {t('runs', 'Runs')} ({stats.data?.runs.total ?? automation.stats.running + automation.stats.succeeded + automation.stats.failed})
            </Tabs.Trigger>
          </Tabs.List>
          <span className="ml-auto text-xs text-muted-foreground">
            {t('step-count', '{{count}} steps', { count: countSteps(definition.steps) })}
            {totalProblems > 0 && <span className="text-destructive"> · {t('problem-count', '{{count}} to fix', { count: totalProblems })}</span>}
          </span>
        </div>
        <Tabs.Content value="build" className="mt-0 flex min-h-0 flex-1">
          <BuilderContext.Provider value={builder}>
            <FlowCanvas
              trigger={{ kind: definition.trigger.kind, ...trigger }}
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

                setSteps(insertStep(definition.steps, address, index, step));
                setSelected(step.id);
              }}
            />
            <aside className="flex w-[440px] shrink-0 flex-col border-l bg-background">
              <div className="flex h-10 shrink-0 items-center gap-1 border-b px-3">
                <Button
                  size="sm"
                  variant={selected === 'settings' ? 'secondary' : 'ghost'}
                  className="h-7"
                  onClick={() => setSelected('settings')}
                >
                  <IconAdjustmentsHorizontal />
                  {t('settings', 'Settings')}
                </Button>
                <Button size="sm" variant={selected === 'trigger' ? 'secondary' : 'ghost'} className="h-7" onClick={() => setSelected('trigger')}>
                  <IconBolt />
                  {t('trigger-kind', 'Trigger')}
                </Button>
                {selectedStep && (
                  <span className="ml-1 truncate text-xs text-muted-foreground">
                    › {t(`step-type.${selectedStep.type}`, STEP_TITLES[selectedStep.type])}
                  </span>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-5 p-4">
                  {selected === 'settings' && (
                    <>
                      {serverProblems.length > 0 && (
                        <ul className="list-disc rounded-md border border-destructive/40 bg-destructive/5 p-3 pl-7 text-sm text-destructive">
                          {serverProblems.map((problem) => (
                            <li key={problem}>{problem}</li>
                          ))}
                        </ul>
                      )}
                      {totalProblems > 0 && (
                        <div className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                          <p className="font-medium text-destructive">{t('needs-attention', 'These steps need attention')}</p>
                          {[...problems.entries()].map(([stepId, list]) => {
                            const step = findStep(definition.steps, stepId);

                            return step ? (
                              <button
                                key={stepId}
                                type="button"
                                className="block w-full truncate text-left text-destructive hover:underline"
                                onClick={() => setSelected(stepId)}
                              >
                                {describeStep(step, { actions, events: builder.events, fields: [...fields, ...builder.outputsBefore(stepId)] }).title}: {list[0]}
                              </button>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label>{t('name', 'Name')}</Label>
                        <Input value={name} disabled={!editable} onChange={(event) => setName(event.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('description', 'Description')}</Label>
                        <Textarea
                          rows={3}
                          value={description}
                          disabled={!editable}
                          placeholder={t('description-placeholder', 'What does it do, and why?')}
                          onChange={(event) => setDescription(event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('reentry', 'The same record may run through')}</Label>
                        <Select
                          value={definition.reentry}
                          disabled={!editable}
                          onValueChange={(reentry) => setDefinition({ ...definition, reentry: reentry as AutomationDefinition['reentry'] })}
                        >
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="always">{t('reentry-always', 'every time')}</Select.Item>
                            <Select.Item value="daily">{t('reentry-daily', 'once a day')}</Select.Item>
                            <Select.Item value="once">{t('reentry-once', 'only once')}</Select.Item>
                          </Select.Content>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('limit', 'Start at most (runs an hour)')}</Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder={t('no-limit', 'no limit')}
                          value={definition.maxRunsPerHour ?? ''}
                          disabled={!editable}
                          onChange={(event) =>
                            setDefinition({ ...definition, maxRunsPerHour: event.target.value ? Math.max(1, Number(event.target.value)) : undefined })
                          }
                        />
                        {(stats.data?.skippedByLimit ?? 0) > 0 && (
                          <p className="text-xs text-warning">{t('skipped-by-limit', '{{count}} skipped by the limit', { count: stats.data!.skippedByLimit })}</p>
                        )}
                      </div>
                      {hasSubject && (
                        <div className="space-y-1.5">
                          <Label>{t('goal', 'Goal: once this holds, the record leaves the automation')}</Label>
                          <ConditionsEditor subject={subject} value={definition.goal} disabled={!editable} onChange={(goal) => setDefinition({ ...definition, goal })} />
                        </div>
                      )}
                    </>
                  )}
                  {selected === 'trigger' && (
                    <TriggerEditor
                      trigger={definition.trigger}
                      events={triggers}
                      disabled={!editable}
                      onChange={(next) => setDefinition({ ...definition, trigger: next })}
                      onStartNow={automation.status === 'active' && editable ? () => start.mutate() : undefined}
                    />
                  )}
                  {selectedStep && (
                    <StepInspector
                      step={selectedStep}
                      actions={actions}
                      subject={subject}
                      disabled={!editable}
                      problems={problems.get(selectedStep.id) ?? []}
                      steps={definition.steps}
                      onChange={(next) => setSteps(replaceStep(definition.steps, next))}
                      onSteps={setSteps}
                      onSelect={setSelected}
                    />
                  )}
                  {selected !== 'settings' && selected !== 'trigger' && !selectedStep && (
                    <p className={cn('text-sm text-muted-foreground')}>{t('nothing-selected', 'Choose a step on the canvas.')}</p>
                  )}
                </div>
              </div>
            </aside>
          </BuilderContext.Provider>
        </Tabs.Content>
        <Tabs.Content value="runs" className="mt-0 flex min-h-0 flex-1">
          <RunsPanel automationId={id} />
        </Tabs.Content>
      </Tabs>
    </PageContainer>
  );
};
