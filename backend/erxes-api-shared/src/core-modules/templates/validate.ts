import type { TAutomationBuiltInTemplateStep } from '../automations/types';
import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  type TTemplate,
  type TTemplateAnswers,
} from './types';

const PART_REFERENCE =
  /\{\{\s*parts\.([A-Za-z0-9_-]+)(?:\.[A-Za-z0-9_-]+)?\s*\}\}/g;
const ANSWER_REFERENCE = /\{\{\s*answers\.([A-Za-z0-9_-]+)\s*\}\}/g;

// The branch ids a step offers: its AI tools, or its split options
const branchIdsOf = (step: TAutomationBuiltInTemplateStep) => {
  const config = (step.config || {}) as {
    tools?: { id?: string }[];
    options?: { id?: string }[];
  };

  if (step.type === 'aiAgent') {
    return (config.tools || []).map(({ id }) => String(id));
  }

  if (step.type === 'split') {
    return [...(config.options || []).map(({ id }) => String(id)), 'fallback'];
  }

  return null;
};

const duplicates = (keys: string[]) =>
  keys.filter((key, index) => keys.indexOf(key) !== index);

const checkFlow = (
  label: string,
  flow: TAutomationBuiltInTemplateStep[],
  workflowKeys: string[],
) => {
  const errors: string[] = [];
  const orders = flow.map(({ order }) => order);

  for (const order of new Set(duplicates(orders.map(String)))) {
    errors.push(`${label}: duplicate step order ${order}`);
  }

  for (const step of flow) {
    const connects = Object.values(step.connects || {});
    const nexts = [
      ...(typeof step.next === 'number'
        ? [step.next]
        : Object.values(step.next || {})),
      ...connects.filter(
        (target): target is number => typeof target === 'number',
      ),
      ...Object.values(step.refs || {}),
      ...(step.target === undefined ? [] : [step.target]),
    ];

    // `refs` writes into config; the record step a step acts on is `target`
    if (step.refs && 'targetActionId' in step.refs) {
      errors.push(
        `${label}: step ${step.order} names its record step with refs; use target`,
      );
    }

    for (const next of nexts) {
      if (!orders.includes(next)) {
        errors.push(
          `${label}: step ${step.order} goes to missing step ${next}`,
        );
      }
    }

    for (const target of connects) {
      if (typeof target === 'string' && !workflowKeys.includes(target)) {
        errors.push(
          `${label}: step ${step.order} connects to missing workflow "${target}"`,
        );
      }
    }

    const ids = branchIdsOf(step);
    const connected = Object.keys(step.connects || {});

    for (const key of connected) {
      if (ids && !ids.includes(key)) {
        errors.push(
          `${label}: step ${step.order} connects unknown branch "${key}"`,
        );
      }
    }

    if (step.type !== 'aiAgent') {
      continue;
    }

    const tools =
      (
        (step.config || {}) as {
          tools?: { id?: string; kind?: string }[];
        }
      ).tools || [];

    for (const { id, kind } of tools) {
      const target = step.connects?.[String(id)];

      // A tool without a branch ends the reply and goes nowhere
      if (target === undefined) {
        errors.push(`${label}: step ${step.order} tool "${id}" has no branch`);
      } else if (kind === 'helper' && typeof target !== 'string') {
        errors.push(
          `${label}: step ${step.order} helper tool "${id}" must run a workflow`,
        );
      }
    }
  }

  return errors;
};

/**
 * Mistakes a template author makes; a plugin runs this over its own
 * templates in a test so a broken one never ships.
 */
export const validateTemplate = (template: TTemplate) => {
  const errors: string[] = [];
  const requirementKeys = template.requirements.map(({ key }) => key);
  const partKeys = template.parts.map(({ key }) => key);
  const journeyKeys = template.journeys.map(({ key }) => key);

  for (const [kind, keys] of [
    ['requirement', requirementKeys],
    ['part', partKeys],
    ['journey', journeyKeys],
  ] as const) {
    for (const key of new Set(duplicates([...keys]))) {
      errors.push(`Duplicate ${kind} key "${key}"`);
    }
  }

  for (const journey of template.journeys) {
    const orders = journey.flow.map(({ order }) => order);
    const workflowKeys = (journey.workflows || []).map(({ key }) => key);

    for (const key of new Set(duplicates(workflowKeys))) {
      errors.push(`Journey "${journey.key}": duplicate workflow key "${key}"`);
    }

    errors.push(
      ...checkFlow(`Journey "${journey.key}"`, journey.flow, workflowKeys),
    );

    for (const workflow of journey.workflows || []) {
      // A workflow's steps stay inside it; its tools connect nowhere else
      errors.push(
        ...checkFlow(
          `Journey "${journey.key}" workflow "${workflow.key}"`,
          workflow.flow,
          [],
        ),
      );
    }

    for (const { order } of journey.highlights || []) {
      if (!orders.includes(order)) {
        errors.push(
          `Journey "${journey.key}": highlight names missing step ${order}`,
        );
      }
    }

    const text = JSON.stringify([
      journey.trigger,
      journey.flow,
      journey.workflows || [],
    ]);

    for (const [, key] of text.matchAll(PART_REFERENCE)) {
      if (!partKeys.includes(key)) {
        errors.push(`Journey "${journey.key}": unknown part "${key}"`);
      }
    }
  }

  const textKeys = template.requirements
    .filter(({ kind }) => kind === TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT)
    .map(({ key }) => key);
  const everything = JSON.stringify([template.parts, template.journeys]);

  const answerKeys = new Set(
    [...everything.matchAll(ANSWER_REFERENCE)].map(([, key]) => key),
  );

  for (const key of answerKeys) {
    if (!textKeys.includes(key)) {
      errors.push(`"{{ answers.${key} }}" names no text requirement`);
    }
  }

  for (const { key, type } of template.parts) {
    // Its owner creates it: `plugin:type`
    if (!/^[a-z0-9_-]+:[A-Za-z0-9_.-]+$/i.test(type)) {
      errors.push(`Part "${key}" type "${type}" names no owning plugin`);
    }
  }

  template.requirements.forEach((requirement, index) => {
    if (requirement.dependsOn) {
      const dependency = requirementKeys.indexOf(requirement.dependsOn);

      // Asked in order, so what it waits for must come first
      if (dependency === -1 || dependency >= index) {
        errors.push(
          `Requirement "${requirement.key}" depends on "${requirement.dependsOn}", which is not asked before it`,
        );
      }
    }

    for (const fill of requirement.fills || []) {
      if (fill.target === 'part') {
        if (!partKeys.includes(fill.part)) {
          errors.push(
            `Requirement "${requirement.key}" fills unknown part "${fill.part}"`,
          );
        }
        continue;
      }

      const journey = template.journeys.find(({ key }) => key === fill.journey);

      if (!journey) {
        errors.push(
          `Requirement "${requirement.key}" fills unknown journey "${fill.journey}"`,
        );
        continue;
      }

      if (
        fill.target === 'step' &&
        !journey.flow.some(({ order }) => order === fill.order)
      ) {
        errors.push(
          `Requirement "${requirement.key}" fills missing step ${fill.order} of "${fill.journey}"`,
        );
      }

      if (fill.target === 'workflow') {
        const workflow = journey.workflows?.find(
          ({ key }) => key === fill.workflow,
        );

        if (!workflow?.flow.some(({ order }) => order === fill.order)) {
          errors.push(
            `Requirement "${requirement.key}" fills missing step ${fill.order} of workflow "${fill.workflow}"`,
          );
        }
      }
    }
  });

  return errors;
};

/** What still keeps installing closed. */
export const getUnansweredTemplateRequirements = (
  template: TTemplate,
  answers: TTemplateAnswers,
) =>
  template.requirements.filter(({ key }) => {
    const answer = answers[key];

    return answer === undefined || answer === null || answer === '';
  });
