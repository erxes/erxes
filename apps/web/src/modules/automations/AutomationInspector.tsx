import type { ActionInfo, Automation, AutomationStep } from '@erxes/core-contract';
import { IconFlask, IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Catalog } from './automationQueries';
import { DataPanel } from './builder/DataPanel';
import { DataTargetContext, dataTargets } from './builder/dataTarget';
import { findStep, replaceStep } from './builder/flowModel';
import { LOOK, type NodeIcon, useStepLook } from './builder/stepLook';
import { TriggerEditor } from './builder/TriggerEditor';
import type { useBuilder } from './builder/useBuilder';
import { type Selection, StepHeader, StepInspector } from './StepInspector';
import { TestPanel } from './TestPanel';
import { TRIGGER_ICONS } from './TemplatePicker';
import type { AutomationMutations } from './useAutomationEditor';
import type { useFlowGuard } from './useFlowGuard';

export interface InspectorProps {
  automation: Automation;
  draft: ReturnType<typeof useFlowGuard>;
  mutations: AutomationMutations;
  catalog: Catalog;
  built: ReturnType<typeof useBuilder>;
  editable: boolean;
  selected: Selection;
  onSelect: (selection: Selection | null) => void;
  /** The trigger in words, as its card shows it. */
  trigger: { title: string };
}

const TriggerPanel = (props: InspectorProps) => {
  const { automation, draft, mutations, editable } = props;
  const { definition } = draft;

  return (
    <TriggerEditor
      trigger={definition.trigger}
      events={props.catalog.triggers}
      apps={props.catalog.apps}
      hook={{
        url: automation.hookUrl,
        on: automation.status === 'active',
        sample: automation.hookSample,
      }}
      disabled={!editable}
      onChange={(trigger) => draft.setDefinition({ ...definition, trigger })}
      onStartNow={
        automation.status === 'active' && editable
          ? () => mutations.start.mutate({ id: automation.id })
          : undefined
      }
    />
  );
};

/** The top of the panel: what is open, as its card on the canvas shows it. */
const PanelHeader = ({
  icon: Icon,
  tone,
  title,
  kind,
  onClose,
  children,
}: {
  icon: NodeIcon;
  tone: string;
  title: string;
  kind: string;
  onClose: () => void;
  children?: ReactNode;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{kind}</span>
      </span>
      {children}
      <Button
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={t('close', 'Close')}
        onClick={onClose}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );
};

const StepPanelHeader = ({
  step,
  actions,
  onClose,
  children,
}: {
  step: AutomationStep;
  actions: ActionInfo[];
  onClose: () => void;
  children: ReactNode;
}) => {
  const look = useStepLook(step, actions);

  return (
    <PanelHeader
      icon={look.icon}
      tone={look.tone}
      title={look.title || look.kind}
      kind={look.kind}
      onClose={onClose}
    >
      {children}
    </PanelHeader>
  );
};

export const AutomationInspector = (props: InspectorProps) => {
  const { t } = useTranslation('automations');
  const { draft, selected, onSelect, editable, automation, built } = props;
  const onClose = () => onSelect(null);
  const { definition } = draft;
  const [targets] = useState(dataTargets);

  const step =
    selected !== 'trigger' && selected !== 'test' ? findStep(definition.steps, selected) : null;

  return (
    <DataTargetContext.Provider value={targets}>
      {(step?.type === 'action' || step?.type === 'decide') && editable && (
        <DataPanel key={step.id} step={step} subject={built.subject} />
      )}
      <aside className="flex w-136 shrink-0 flex-col border-l bg-background">
        {selected === 'trigger' && (
          <PanelHeader
            tone={LOOK.trigger.tone}
            icon={TRIGGER_ICONS[definition.trigger.kind]}
            title={props.trigger.title}
            kind={t('trigger-kind', 'When')}
            onClose={onClose}
          />
        )}
        {selected === 'test' && (
          <PanelHeader
            icon={IconFlask}
            tone="bg-muted text-muted-foreground"
            title={t('test', 'Test')}
            kind={automation.name}
            onClose={onClose}
          />
        )}
        {step && (
          <StepPanelHeader step={step} actions={built.actions} onClose={onClose}>
            <StepHeader
              step={step}
              steps={definition.steps}
              disabled={!editable}
              problems={built.problems.get(step.id)?.length ?? 0}
              onSteps={draft.setSteps}
              onSelect={onSelect}
            />
          </StepPanelHeader>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 p-4">
            {selected === 'trigger' && <TriggerPanel {...props} />}
            {selected === 'test' && (
              <TestPanel
                automation={automation}
                definition={definition}
                subject={built.hasSubject ? built.subject : null}
                dirty={draft.dirty}
              />
            )}
            {step && (
              <StepInspector
                step={step}
                actions={built.actions}
                subject={built.subject}
                disabled={!editable}
                problems={built.problems.get(step.id) ?? []}
                onChange={(next) => draft.setSteps(replaceStep(definition.steps, next))}
              />
            )}
          </div>
        </div>
      </aside>
    </DataTargetContext.Provider>
  );
};
