import type { ActionInfo, Automation } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal, IconBolt } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { Catalog } from './automationQueries';
import { AutomationSettings, ProblemList } from './AutomationSettings';
import type { FieldInfo } from './builder/useAutomationFields';
import { describeStep, findStep, replaceStep, STEP_TITLES } from './builder/flowModel';
import { BuilderContext } from './builder/BuilderContext';
import { TriggerEditor } from './builder/TriggerEditor';
import { type Selection, StepInspector } from './StepInspector';
import type { useAutomationDraft } from './useAutomationEditor';

export interface InspectorProps {
  automation: Automation;
  draft: ReturnType<typeof useAutomationDraft>;
  catalog: Catalog;
  actions: ActionInfo[];
  fields: FieldInfo[];
  fieldsError: Error | null;
  subject: 'customer' | 'company';
  hasSubject: boolean;
  editable: boolean;
  problems: Map<string, string[]>;
  serverProblems: string[];
  skippedByLimit: number;
  selected: Selection;
  onSelect: (selection: Selection) => void;
  onStartNow: (() => void) | undefined;
}

const InspectorTabs = ({
  selected,
  onSelect,
  stepType,
}: {
  selected: Selection;
  onSelect: (selection: Selection) => void;
  stepType: keyof typeof STEP_TITLES | undefined;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b px-3">
      <Button
        size="sm"
        variant={selected === 'settings' ? 'secondary' : 'ghost'}
        className="h-7"
        onClick={() => onSelect('settings')}
      >
        <IconAdjustmentsHorizontal />
        {t('settings', 'Settings')}
      </Button>
      <Button
        size="sm"
        variant={selected === 'trigger' ? 'secondary' : 'ghost'}
        className="h-7"
        onClick={() => onSelect('trigger')}
      >
        <IconBolt />
        {t('trigger-kind', 'Trigger')}
      </Button>
      {stepType && (
        <span className="ml-1 truncate text-xs text-muted-foreground">
          › {t(`step-type.${stepType}`, STEP_TITLES[stepType])}
        </span>
      )}
    </div>
  );
};

const SettingsPanel = (props: InspectorProps) => {
  const { draft, actions, fields, problems, onSelect } = props;
  const { events, outputsBefore } = useContext(BuilderContext);

  const stepProblems = [...problems.entries()].flatMap(([stepId, list]) => {
    const step = findStep(draft.definition.steps, stepId);

    return step
      ? [
          {
            stepId,
            first: list[0],
            title: describeStep(step, {
              actions,
              events,
              fields: [...fields, ...outputsBefore(stepId)],
            }).title,
          },
        ]
      : [];
  });

  return (
    <>
      <ProblemList
        serverProblems={props.serverProblems}
        stepProblems={stepProblems}
        onSelect={onSelect}
      />
      <AutomationSettings
        draft={draft}
        editable={props.editable}
        subject={props.hasSubject ? props.subject : null}
        skippedByLimit={props.skippedByLimit}
        fieldsError={props.fieldsError}
      />
    </>
  );
};

/** The right-hand panel: the automation's settings, its trigger, or the selected step. */
export const AutomationInspector = (props: InspectorProps) => {
  const { t } = useTranslation('automations');
  const { draft, selected, onSelect, editable } = props;
  const { definition } = draft;

  const selectedStep =
    selected !== 'settings' && selected !== 'trigger' ? findStep(definition.steps, selected) : null;

  return (
    <aside className="flex w-[440px] shrink-0 flex-col border-l bg-background">
      <InspectorTabs selected={selected} onSelect={onSelect} stepType={selectedStep?.type} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 p-4">
          {selected === 'settings' && <SettingsPanel {...props} />}
          {selected === 'trigger' && (
            <TriggerEditor
              trigger={definition.trigger}
              events={props.catalog.triggers}
              disabled={!editable}
              onChange={(trigger) => draft.setDefinition({ ...definition, trigger })}
              onStartNow={props.onStartNow}
            />
          )}
          {selectedStep && (
            <StepInspector
              step={selectedStep}
              actions={props.actions}
              subject={props.subject}
              disabled={!editable}
              problems={props.problems.get(selectedStep.id) ?? []}
              steps={definition.steps}
              onChange={(next) => draft.setSteps(replaceStep(definition.steps, next))}
              onSteps={draft.setSteps}
              onSelect={onSelect}
            />
          )}
          {selected !== 'settings' && selected !== 'trigger' && !selectedStep && (
            <p className="text-sm text-muted-foreground">
              {t('nothing-selected', 'Choose a step on the canvas.')}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
