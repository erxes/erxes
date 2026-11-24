import type { Automation } from '@erxes/core-contract';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Catalog } from './automationQueries';
import { DataPanel } from './builder/DataPanel';
import { DataTargetContext, dataTargets } from './builder/dataTarget';
import { findStep, replaceStep, STEP_TITLES } from './builder/flowModel';
import { TriggerEditor } from './builder/TriggerEditor';
import type { useBuilder } from './builder/useBuilder';
import { type Selection, StepHeader, StepInspector } from './StepInspector';
import { TestPanel } from './TestPanel';
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
  onSelect: (selection: Selection) => void;
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
      costOf={draft.triggerCost}
      onChange={(trigger) => draft.setDefinition({ ...definition, trigger })}
      onStartNow={
        automation.status === 'active' && editable
          ? () => mutations.start.mutate({ id: automation.id })
          : undefined
      }
    />
  );
};

export const AutomationInspector = (props: InspectorProps) => {
  const { t } = useTranslation('automations');
  const { draft, selected, onSelect, editable, automation, built } = props;
  const { definition } = draft;
  const [targets] = useState(dataTargets);

  const step =
    selected !== 'trigger' && selected !== 'test' ? findStep(definition.steps, selected) : null;

  const heading =
    selected === 'trigger'
      ? t('trigger-kind', 'Trigger')
      : selected === 'test'
        ? t('test', 'Test')
        : step
          ? t(`step-type.${step.type}`, STEP_TITLES[step.type])
          : '';

  return (
    <DataTargetContext.Provider value={targets}>
      {(step?.type === 'action' || step?.type === 'decide') && editable && (
        <DataPanel key={step.id} step={step} subject={built.subject} />
      )}
      <aside className="flex w-136 shrink-0 flex-col border-l bg-background">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b pr-2 pl-4 text-sm font-medium">
          <span className="min-w-0 flex-1 truncate">{heading}</span>
          {step && (
            <StepHeader
              step={step}
              steps={definition.steps}
              disabled={!editable}
              problems={built.problems.get(step.id)?.length ?? 0}
              onSteps={draft.setSteps}
              onSelect={onSelect}
            />
          )}
        </div>
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
            {selected !== 'trigger' && selected !== 'test' && !step && (
              <p className="text-sm text-muted-foreground">
                {t('nothing-selected', 'Choose a step on the canvas.')}
              </p>
            )}
          </div>
        </div>
      </aside>
    </DataTargetContext.Provider>
  );
};
