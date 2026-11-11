import type { TAutomationBuiltInTemplateStep } from '../automations/types';
import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  type TTemplate,
  type TTemplateAnswers,
} from './types';

const PART_REFERENCE = /\{\{\s*parts\.([A-Za-z0-9_-]+)\s*\}\}/g;
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

    for (const order of new Set(duplicates(orders.map(String)))) {
      errors.push(`Journey "${journey.key}": duplicate step order ${order}`);
    }

    for (const step of journey.flow) {
      const nexts = [
        ...(typeof step.next === 'number'
          ? [step.next]
          : Object.values(step.next || {})),
        ...Object.values(step.connects || {}),
        ...(step.target === undefined ? [] : [step.target]),
      ];

      for (const next of nexts) {
        if (!orders.includes(next)) {
          errors.push(
            `Journey "${journey.key}": step ${step.order} goes to missing step ${next}`,
          );
        }
      }
    }

    for (const step of journey.flow) {
      const ids = branchIdsOf(step);
      const connected = Object.keys(step.connects || {});

      for (const key of connected) {
        if (ids && !ids.includes(key)) {
          errors.push(
            `Journey "${journey.key}": step ${step.order} connects unknown branch "${key}"`,
          );
        }
      }

      // A handoff tool without a branch ends the reply and goes nowhere
      if (step.type === 'aiAgent') {
        for (const id of ids || []) {
          if (!connected.includes(id)) {
            errors.push(
              `Journey "${journey.key}": step ${step.order} tool "${id}" has no branch`,
            );
          }
        }
      }
    }

    for (const { order } of journey.highlights || []) {
      if (!orders.includes(order)) {
        errors.push(
          `Journey "${journey.key}": highlight names missing step ${order}`,
        );
      }
    }

    const text = JSON.stringify([journey.trigger, journey.flow]);

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
