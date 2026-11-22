import type { AutomationDefinition } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type Catalog, statsQuery } from '../automationQueries';
import { flowProblems, REPLY_ACTION, stepOutputFields } from './flowChecks';
import { useAutomationFields } from './useAutomationFields';

/** The record type runs are about, and whether the trigger gives one at all. */
const subjectOf = (trigger: AutomationDefinition['trigger'], triggers: Catalog['triggers']) => {
  if (trigger.kind === 'event') {
    const event = triggers.find((item) => item.type === trigger.event);

    return { subject: event?.subject ?? 'customer', hasSubject: Boolean(event?.subject) };
  }

  if (trigger.kind === 'date') return { subject: trigger.subject, hasSubject: true };

  if (trigger.kind === 'webhook')
    return { subject: trigger.subject?.type ?? 'customer', hasSubject: Boolean(trigger.subject) };

  const audience = 'audience' in trigger ? trigger.audience : undefined;

  return { subject: audience?.type ?? 'customer', hasSubject: Boolean(audience) };
};

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

  const { subject, hasSubject } = subjectOf(definition.trigger, catalog.triggers);
  const hooked = definition.trigger.kind === 'webhook';

  const { fields, error: fieldsError } = useAutomationFields(
    hasSubject ? subject : null,
    automationId,
  );

  const actions = useMemo(
    () =>
      catalog.actions.filter(
        (action) =>
          (hooked || action.type !== REPLY_ACTION) &&
          (!action.subject ||
            (hasSubject && (action.subject === 'any' || action.subject === subject))),
      ),
    [catalog.actions, hasSubject, subject, hooked],
  );

  const problems = useMemo(
    () => flowProblems(definition.steps, actions, catalog.actions),
    [definition, actions, catalog.actions],
  );

  const builder = useMemo(() => {
    const events = catalog.triggers.filter((item) => item.subject);
    const { trigger } = definition;

    const started =
      trigger.kind === 'event'
        ? catalog.triggers.find((item) => item.type === trigger.event)
        : undefined;

    return {
      automationId,
      events,
      stats: new Map((stats.data?.steps ?? []).map((step) => [step.stepId, step])),
      outputsBefore: (stepId: string) =>
        stepOutputFields(definition.steps, stepId, { events, actions, trigger: started }),
      trigger: started,
      hasSubject,
      knownActions: catalog.actions,
    };
  }, [
    automationId,
    catalog.triggers,
    catalog.actions,
    stats.data,
    definition,
    actions,
    hasSubject,
  ]);

  return { stats, subject, hasSubject, fields, fieldsError, actions, problems, builder };
};
