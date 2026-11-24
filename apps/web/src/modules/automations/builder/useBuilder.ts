import type { AutomationDefinition } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type Catalog, outputsQuery, statsQuery } from '../automationQueries';
import { startingEventType } from './AppTriggerSettings';
import { flowProblems, stepOutputFields } from './flowChecks';
import { actionsFor, subjectOf } from './flowFit';
import { useAutomationFields } from './useAutomationFields';

/**
 * The builder's derived data: actions for this subject, each step's problems,
 * and what the builder parts share (events, per-step stats, earlier outputs).
 */
export const useBuilder = (
  catalog: Catalog,
  definition: AutomationDefinition,
  automationId: string,
) => {
  const stats = useQuery(statsQuery(automationId));
  const learned = useQuery(outputsQuery(automationId));

  const { subject, hasSubject } = subjectOf(definition.trigger, catalog.triggers);

  const { fields, error: fieldsError } = useAutomationFields(
    hasSubject ? subject : null,
    automationId,
  );

  const actions = useMemo(
    () => actionsFor(catalog, definition.trigger),
    [catalog, definition.trigger],
  );

  const problems = useMemo(
    () => flowProblems(definition.steps, actions, catalog.actions),
    [definition, actions, catalog.actions],
  );

  const builder = useMemo(() => {
    const events = catalog.triggers.filter((item) => item.subject && item.subject === subject);
    const { trigger } = definition;

    const type = startingEventType(trigger);
    const started = type ? catalog.triggers.find((item) => item.type === type) : undefined;

    return {
      automationId,
      events,
      stats: new Map((stats.data?.steps ?? []).map((step) => [step.stepId, step])),
      outputsBefore: (stepId: string) =>
        stepOutputFields(definition.steps, stepId, {
          events: catalog.triggers,
          actions,
          trigger: started,
          learned: new Map((learned.data?.data ?? []).map((step) => [step.stepId, step.fields])),
        }),
      trigger: started,
      hasSubject,
      subject: hasSubject ? subject : null,
      steps: definition.steps,
      knownActions: catalog.actions,
      knownEvents: catalog.triggers,
    };
  }, [
    automationId,
    catalog.triggers,
    catalog.actions,
    stats.data,
    learned.data,
    definition,
    actions,
    hasSubject,
    subject,
  ]);

  return { stats, subject, hasSubject, fields, fieldsError, actions, problems, builder };
};
