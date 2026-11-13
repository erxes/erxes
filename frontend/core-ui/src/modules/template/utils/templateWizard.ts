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

// Kinds a template may preset to whoever is installing it
const MEMBER_KINDS = ['core:team.members', 'core:team.member'];

/**
 * What the wizard opens with: each declared default answer, and the person
 * installing for "who takes over", so a first install is mostly checking.
 */
export const defaultTemplateAnswers = (
  requirements: TTemplateRequirement[],
  currentUserId?: string,
): TTemplateAnswers =>
  Object.fromEntries(
    requirements.flatMap(({ key, kind, defaultAnswer }) => {
      if (defaultAnswer !== undefined && defaultAnswer !== null) {
        return [[key, defaultAnswer]];
      }

      return currentUserId && MEMBER_KINDS.includes(kind)
        ? [[key, `[[ user.${currentUserId} ]]`]]
        : [];
    }),
  );

export type TTemplateStepGroup = 'connect' | 'people' | 'words';

const GROUP_ORDER: TTemplateStepGroup[] = ['connect', 'people', 'words'];

/** What a step is about, so related steps sit together. */
export const templateStepGroupOf = (kind: string): TTemplateStepGroup => {
  if (MEMBER_KINDS.includes(kind)) {
    return 'people';
  }

  return kind === 'core:text' || kind === 'core:emails.content'
    ? 'words'
    : 'connect';
};

/**
 * The order the wizard asks in: connections, then people, then wording, each
 * keeping the template's own order. Steps open in this order.
 */
export const orderTemplateRequirements = (
  requirements: TTemplateRequirement[],
) =>
  GROUP_ORDER.flatMap((group) =>
    requirements.filter(({ kind }) => templateStepGroupOf(kind) === group),
  );

/** The ordered steps split into their groups, empty groups left out. */
export const groupTemplateRequirements = (ordered: TTemplateRequirement[]) =>
  GROUP_ORDER.map((group) => ({
    group,
    steps: ordered
      .map((requirement, index) => ({ requirement, index }))
      .filter(
        ({ requirement }) => templateStepGroupOf(requirement.kind) === group,
      ),
  })).filter(({ steps }) => steps.length > 0);

// The first step still waiting, or none when everything is answered
export const firstUnansweredTemplateStep = (
  ordered: TTemplateRequirement[],
  answers: TTemplateAnswers,
) => ordered.find(({ key }) => !isTemplateAnswered(answers[key]))?.key ?? null;

/** Whether an answer is still the one the wizard opened with. */
export const isTemplateDefaultAnswer = (answer: unknown, initial: unknown) =>
  isTemplateAnswered(answer) &&
  JSON.stringify(answer) === JSON.stringify(initial);

// `[[ user.<id> ]]` tokens, as member answers are written
export const templateMemberIds = (value: unknown) =>
  typeof value === 'string'
    ? [...value.matchAll(/\[\[\s*user\.([^\]\s]+)\s*\]\]/g)].map(([, id]) => id)
    : [];

/**
 * A finished answer in one line, for the kinds core can read itself. Any
 * other kind is named by its plugin, so an id is never shown as text.
 */
export const templateAnswerText = (kind: string, value: unknown) => {
  if (kind === 'core:text') {
    return typeof value === 'string' ? value.split('\n')[0] : '';
  }

  const answer = (value || {}) as Record<string, unknown>;
  const parts =
    kind === 'core:emails.content'
      ? [answer.subject]
      : kind === 'core:emails.sender'
      ? [answer.name, answer.value]
      : [];

  return parts.filter((part) => typeof part === 'string' && part).join(' · ');
};

/**
 * A text split at its `{{ ... }}` placeholders, so a summary can show them
 * as tokens rather than raw braces.
 */
export const splitTemplatePlaceholders = (text: string) =>
  text
    .split(/(\{\{[^}]*\}\})/)
    .filter(Boolean)
    .map((part) => {
      const token = /^\{\{\s*([^}]*?)\s*\}\}$/.exec(part);

      return token
        ? { text: token[1], isToken: true }
        : { text: part, isToken: false };
    });

// A journey named "<template> · Paid" reads as "Paid" under that template
export const templateJourneyShortName = (
  journeyName: string,
  templateName?: string,
) => {
  const prefix = `${templateName} · `;

  return templateName && journeyName.startsWith(prefix)
    ? journeyName.slice(prefix.length)
    : journeyName;
};
