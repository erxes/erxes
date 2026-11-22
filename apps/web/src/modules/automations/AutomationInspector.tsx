import type { Automation } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import type { Catalog } from './automationQueries';
import { findStep, replaceStep, STEP_TITLES } from './builder/flowModel';
import { TriggerEditor } from './builder/TriggerEditor';
import type { useBuilder } from './builder/useBuilder';
import { type Selection, StepInspector } from './StepInspector';
import { TestPanel } from './TestPanel';
import type { AutomationMutations, useAutomationDraft } from './useAutomationEditor';

export interface InspectorProps {
  automation: Automation;
  draft: ReturnType<typeof useAutomationDraft>;
  mutations: AutomationMutations;
  catalog: Catalog;
  built: ReturnType<typeof useBuilder>;
  editable: boolean;
  selected: Selection;
  onSelect: (selection: Selection) => void;
  onTested: () => void;
}

const TriggerPanel = (props: InspectorProps) => {
  const { automation, draft, mutations, editable } = props;
  const { definition } = draft;

  return (
    <TriggerEditor
      trigger={definition.trigger}
      events={props.catalog.triggers}
      hook={{
        url: automation.hookUrl,
        on: automation.status === 'active',
        sample: automation.hookSample,
      }}
      disabled={!editable}
      onChange={(trigger) => {
        const next = { ...definition, trigger };

        draft.setDefinition(next);

        if (trigger.kind !== definition.trigger.kind && automation.status !== 'active')
          mutations.save.mutate({ ...draft.input, definition: next });
      }}
      onStartNow={
        automation.status === 'active' && editable
          ? () => mutations.start.mutate({ id: automation.id })
          : undefined
      }
    />
  );
};

/** The right-hand panel: the trigger, the selected step, or the test. */
export const AutomationInspector = (props: InspectorProps) => {
  const { t } = useTranslation('automations');
  const { draft, selected, onSelect, editable, automation, mutations, built } = props;
  const { definition } = draft;

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
    <aside className="flex w-110 shrink-0 flex-col border-l bg-background">
      <div className="flex h-10 shrink-0 items-center border-b px-4 text-sm font-medium">
        {heading}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 p-4">
          {selected === 'trigger' && <TriggerPanel {...props} />}
          {selected === 'test' && (
            <TestPanel
              automation={automation}
              subject={built.hasSubject ? built.subject : null}
              dirty={draft.dirty}
              onSave={() => mutations.save.mutateAsync(draft.input)}
              onTested={props.onTested}
            />
          )}
          {step && (
            <StepInspector
              step={step}
              actions={built.actions}
              subject={built.subject}
              disabled={!editable}
              problems={built.problems.get(step.id) ?? []}
              steps={definition.steps}
              onChange={(next) => draft.setSteps(replaceStep(definition.steps, next))}
              onSteps={draft.setSteps}
              onSelect={onSelect}
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
  );
};
