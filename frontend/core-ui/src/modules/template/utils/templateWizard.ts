import { TTemplateAnswers, TTemplateRequirement } from '@/template/types';

export const isTemplateAnswered = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

/**
 * A step opens only once every step before it, and the one it depends on,
 * has an answer: an unanswered step keeps everything after it closed.
 */
export const isTemplateStepOpen = (
  requirements: TTemplateRequirement[],
  index: number,
  answers: TTemplateAnswers,
) => {
  const requirement = requirements[index];

  if (!requirement) {
    return false;
  }

  const priorAnswered = requirements
    .slice(0, index)
    .every(({ key }) => isTemplateAnswered(answers[key]));

  return (
    priorAnswered &&
    (!requirement.dependsOn ||
      isTemplateAnswered(answers[requirement.dependsOn]))
  );
};

export const countUnansweredTemplateSteps = (
  requirements: TTemplateRequirement[],
  answers: TTemplateAnswers,
) => requirements.filter(({ key }) => !isTemplateAnswered(answers[key])).length;

// The step to show: the first one still waiting for an answer
export const firstOpenTemplateStep = (
  requirements: TTemplateRequirement[],
  answers: TTemplateAnswers,
) => {
  const index = requirements.findIndex(
    ({ key }) => !isTemplateAnswered(answers[key]),
  );

  return index === -1 ? Math.max(requirements.length - 1, 0) : index;
};
