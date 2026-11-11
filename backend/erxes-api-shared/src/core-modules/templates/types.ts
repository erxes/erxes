import type { TAutomationBuiltInTemplateStep } from '../automations/types';

/** Requirement kinds core answers itself; plugins answer their own. */
export const TEMPLATE_CORE_REQUIREMENT_KINDS = {
  TEXT: 'core:text',
  EMAIL_SENDER: 'core:emails.sender',
  // An email step's subject and body, written in the email editor
  EMAIL_CONTENT: 'core:emails.content',
  // `[[ user.<id> ]]` tokens joined by commas, as the builder's member picker writes them
  TEAM_MEMBERS: 'core:team.members',
  AI_AGENT: 'automations:aiAgent',
} as const;

/**
 * Where an answer lands: a journey's step, its trigger, or a part. `from`
 * picks a field of an answer reported as an object (a sender and its name).
 */
export type TTemplateFill =
  | {
      target: 'step';
      journey: string;
      order: number;
      path: string;
      from?: string;
    }
  | { target: 'trigger'; journey: string; path: string; from?: string }
  | { target: 'part'; part: string; path: string; from?: string };

/**
 * Something only the organization can give. Every requirement must be
 * answered, in order: an unanswered one keeps the next one and installing
 * closed. A value the organization writes itself is a `core:text` requirement;
 * besides `fills`, its text can go inside a longer one as `{{ answers.<key> }}`.
 */
export type TTemplateRequirement = {
  key: string;
  kind: string;
  label: string;
  description?: string;
  // Stays closed until that requirement has a value
  dependsOn?: string;
  // For `core:text`
  input?: { multiline?: boolean; placeholder?: string };
  fills?: TTemplateFill[];
};

/** A record the template creates while installing. */
export type TTemplatePart = {
  key: string;
  type: 'automations:aiAgent';
  defaults: Record<string, unknown>;
};

/** One automation: its trigger and its steps addressed by `order`. */
export type TTemplateJourney = {
  key: string;
  name: string;
  description?: string;
  trigger: { type: string; config?: Record<string, unknown> };
  flow: TAutomationBuiltInTemplateStep[];
  /**
   * The branches a template card draws, with short names that fit a tile.
   * When absent, the steps right after the entry step are shown.
   */
  highlights?: { order: number; label: string; icon?: string }[];
};

/**
 * A solution installed in one go, such as an AI employee: what to ask, what
 * to create and which automations to build. Declared in a plugin's code;
 * an installed copy keeps its own life and never follows later versions.
 */
export type TTemplate = {
  id: string;
  version: number;
  name: string;
  description?: string;
  // A Tabler icon name, e.g. `IconHeadset`
  icon?: string;
  requirements: TTemplateRequirement[];
  parts: TTemplatePart[];
  journeys: TTemplateJourney[];
};

export type TTemplateAnswers = Record<string, unknown>;
