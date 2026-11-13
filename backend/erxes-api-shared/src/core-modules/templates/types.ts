import type { TAutomationBuiltInTemplateStep } from '../automations/types';

/** Requirement kinds core answers itself; plugins answer their own. */
export const TEMPLATE_CORE_REQUIREMENT_KINDS = {
  TEXT: 'core:text',
  EMAIL_SENDER: 'core:emails.sender',
  // An email step's subject and body, written in the email editor
  EMAIL_CONTENT: 'core:emails.content',
  // `[[ user.<id> ]]` tokens joined by commas, as the builder's member picker writes them
  TEAM_MEMBERS: 'core:team.members',
  // One member, as a `[[ user.<id> ]]` token
  TEAM_MEMBER: 'core:team.member',
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
  | {
      target: 'workflow';
      journey: string;
      workflow: string;
      order: number;
      path: string;
      from?: string;
    }
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
  // Answered already when the wizard opens, e.g. a written-out policy
  defaultAnswer?: unknown;
  fills?: TTemplateFill[];
};

/**
 * A record the template creates while installing. `automations:aiAgent` is
 * created by core; any other `plugin:type` by that plugin's `templateParts`.
 * Steps read its id as `{{ parts.<key> }}` and what came with it as
 * `{{ parts.<key>.<ref> }}`.
 */
export type TTemplatePart = {
  key: string;
  type: string;
  // How the install summary names what it is, e.g. "Ticket desk"
  label?: string;
  // A Tabler icon name for that summary
  icon?: string;
  defaults: Record<string, unknown>;
};

/**
 * A sub-flow inside a journey that an AI agent's helper tool runs and reads
 * the result of. `inputs` left empty are what the agent fills as the tool's
 * parameters (`attachmentIds` and `ticketId` from the conversation, never
 * invented); a bound one, e.g. `{{ trigger.customerId }}`, the system fills.
 * Steps read inputs as `{{ input.<name> }}`.
 */
export type TTemplateWorkflow = {
  key: string;
  name: string;
  description?: string;
  inputs: Record<string, string>;
  // What an input the agent fills means, and its allowed values
  inputHints?: Record<string, { description?: string; enum?: string[] }>;
  // What the agent reads back; the last step's result when absent
  output?: string;
  flow: TAutomationBuiltInTemplateStep[];
};

/** One automation: its trigger and its steps addressed by `order`. */
export type TTemplateJourney = {
  key: string;
  name: string;
  description?: string;
  trigger: { type: string; config?: Record<string, unknown> };
  flow: TAutomationBuiltInTemplateStep[];
  workflows?: TTemplateWorkflow[];
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
  // A Tabler icon the erxes-ui icon registry has, e.g. `IconHeadphones`
  icon?: string;
  requirements: TTemplateRequirement[];
  parts: TTemplatePart[];
  journeys: TTemplateJourney[];
};

export type TTemplateAnswers = Record<string, unknown>;
