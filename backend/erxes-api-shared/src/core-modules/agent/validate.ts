import { z } from 'zod';
import type {
  IAgentPluginMetaRejection,
  IAgentSkillMeta,
  IValidatedAgentPluginMeta,
} from './types';

export const AGENT_SKILL_LIMITS = {
  maxSkillsPerPlugin: 8,
  maxNameLength: 40,
  maxDescriptionLength: 300,
  maxInstructionsLength: 12_000,
  maxOperationsPerSkill: 20,
  maxHiddenOperationsPerPlugin: 100,
} as const;

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GRAPHQL_NAME = /^[_A-Za-z]\w{0,99}$/;
// Descriptions are one line; instructions keep tabs and line breaks.
// eslint-disable-next-line no-control-regex
const DESCRIPTION_CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const INSTRUCTION_CONTROL_CHARACTERS =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

const graphqlName = z
  .string()
  .regex(GRAPHQL_NAME, 'must be a GraphQL root field name');

const skillSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(AGENT_SKILL_LIMITS.maxNameLength)
      .regex(
        SKILL_NAME,
        'must use lowercase letters, digits and single hyphens',
      ),
    description: z
      .string()
      .trim()
      .min(1)
      .max(AGENT_SKILL_LIMITS.maxDescriptionLength)
      .refine((value) => !DESCRIPTION_CONTROL_CHARACTERS.test(value), {
        message: 'must be a single line without control characters',
      }),
    instructions: z
      .string()
      .trim()
      .min(1)
      .max(AGENT_SKILL_LIMITS.maxInstructionsLength)
      .refine((value) => !INSTRUCTION_CONTROL_CHARACTERS.test(value), {
        message: 'must not contain control characters',
      }),
    operations: z
      .array(graphqlName)
      .max(AGENT_SKILL_LIMITS.maxOperationsPerSkill)
      .optional(),
  })
  .strict();

const hiddenOperationsSchema = z
  .object({
    queries: z.array(graphqlName).optional(),
    mutations: z.array(graphqlName).optional(),
  })
  .strict()
  .refine(
    ({ queries = [], mutations = [] }) =>
      queries.length + mutations.length <=
      AGENT_SKILL_LIMITS.maxHiddenOperationsPerPlugin,
    {
      message: `must list at most ${AGENT_SKILL_LIMITS.maxHiddenOperationsPerPlugin} operations`,
    },
  );

// Not strict: a newer plugin may declare fields this core does not know yet.
const metaSchema = z.object({
  skills: z.array(z.unknown()).optional(),
  hiddenOperations: z.unknown().optional(),
});

const describeIssue = (error: z.ZodError): string => {
  const [issue] = error.issues;

  if (!issue) {
    return 'is invalid';
  }

  const path = issue.path.join('.');

  if (issue.code === z.ZodIssueCode.unrecognized_keys) {
    return `${path ? `${path} has ` : ''}unsupported field(s) ${issue.keys.join(
      ', ',
    )}`;
  }

  return path ? `${path} ${issue.message}` : issue.message;
};

const skillLabel = (value: unknown): string | undefined => {
  const name = (value as { name?: unknown } | null)?.name;

  return typeof name === 'string' ? name.slice(0, 80) : undefined;
};

/**
 * Validates a plugin's `meta.agent` declaration. Every skill is checked on its
 * own, so one invalid skill never drops the others. Skills are text only:
 * any field beyond name, description, instructions and operations (a tool,
 * script or function) rejects that skill.
 */
export const validateAgentPluginMeta = (
  value: unknown,
): IValidatedAgentPluginMeta => {
  const result: IValidatedAgentPluginMeta = {
    skills: [],
    hiddenOperations: { queries: [], mutations: [] },
    rejections: [],
  };
  const reject = (rejection: IAgentPluginMetaRejection) =>
    result.rejections.push(rejection);

  if (value === undefined || value === null) {
    return result;
  }

  const meta = metaSchema.safeParse(value);

  if (!meta.success) {
    reject({ reason: `agent metadata ${describeIssue(meta.error)}` });
    return result;
  }

  const names = new Set<string>();

  (meta.data.skills ?? []).forEach((candidate, index) => {
    const skill = skillLabel(candidate);

    if (index >= AGENT_SKILL_LIMITS.maxSkillsPerPlugin) {
      reject({
        skill,
        reason: `exceeds the limit of ${AGENT_SKILL_LIMITS.maxSkillsPerPlugin} skills per plugin`,
      });
      return;
    }

    const parsed = skillSchema.safeParse(candidate);

    if (!parsed.success) {
      reject({ skill, reason: describeIssue(parsed.error) });
      return;
    }

    if (names.has(parsed.data.name)) {
      reject({ skill, reason: 'duplicates another skill name' });
      return;
    }

    names.add(parsed.data.name);
    const accepted: IAgentSkillMeta = {
      name: parsed.data.name,
      description: parsed.data.description,
      instructions: parsed.data.instructions,
    };

    if (parsed.data.operations?.length) {
      accepted.operations = [...new Set(parsed.data.operations)];
    }

    result.skills.push(accepted);
  });

  if (meta.data.hiddenOperations !== undefined) {
    const hidden = hiddenOperationsSchema.safeParse(meta.data.hiddenOperations);

    if (hidden.success) {
      result.hiddenOperations = {
        queries: [...new Set(hidden.data.queries ?? [])],
        mutations: [...new Set(hidden.data.mutations ?? [])],
      };
    } else {
      reject({ reason: `hiddenOperations ${describeIssue(hidden.error)}` });
    }
  }

  return result;
};
