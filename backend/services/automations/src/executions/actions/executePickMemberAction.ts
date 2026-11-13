import {
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  TAvailabilityStatus,
  TPickMemberActionConfig,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '../../connectionResolver';

type TMemberAvailability = {
  _id: string;
  isActive: boolean;
  status: TAvailabilityStatus;
};

const toIds = (value: unknown): string[] => [
  ...new Set(
    (Array.isArray(value) ? value : String(value ?? '').split(','))
      .map((id) => String(id ?? '').trim())
      .filter(Boolean),
  ),
];

/** Candidates who take new work now, in a stable order for taking turns. */
export const availableCandidates = (
  candidateIds: string[],
  members: TMemberAvailability[],
) => {
  const byId = new Map(members.map((member) => [member._id, member]));

  return candidateIds
    .filter((id) => {
      const member = byId.get(id);
      return member?.isActive && member.status === 'available';
    })
    .sort();
};

export const pickByTurn = (available: string[], turn: number) =>
  available[(((turn - 1) % available.length) + available.length) % available.length];

type TDependencies = {
  loadAvailability: (userIds: string[]) => Promise<TMemberAvailability[]>;
  nextTurn: (key: string) => Promise<number>;
  random: () => number;
};

/**
 * One available team member for the run: inactive members and those who are
 * unavailable (declared, or in the company's busy segment) are left out, then
 * the step takes turns or picks at random. With nobody left it gives the
 * fallback member, or skips. It assigns nothing itself; later steps use
 * `userId`.
 */
export const executePickMemberActionWithDependencies = async (
  {
    subdomain,
    execution,
    action,
  }: {
    subdomain: string;
    execution: IAutomationExecutionDocument;
    action: IAutomationAction<TPickMemberActionConfig>;
  },
  { loadAvailability, nextTurn, random }: TDependencies,
) => {
  const config = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });
  const candidateIds = toIds(config.candidateIds);

  if (!candidateIds.length) {
    return buildSkippedAction('no-candidates');
  }

  const available = availableCandidates(
    candidateIds,
    await loadAvailability(candidateIds),
  );

  if (!available.length) {
    const fallbackUserId = toIds(config.fallbackUserId)[0];

    return fallbackUserId
      ? { userId: fallbackUserId, userIds: [], fallback: true }
      : buildSkippedAction('nobody-available', {
          candidates: candidateIds.length,
        });
  }

  const userId =
    config.method === 'random'
      ? available[Math.floor(random() * available.length)]
      : pickByTurn(
          available,
          await nextTurn(`${execution.automationId}:${action.id}`),
        );

  return { userId, userIds: available, fallback: false };
};

export const executePickMemberAction = async (args: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction<TPickMemberActionConfig>;
}) => {
  const models = await generateModels(args.subdomain);

  return executePickMemberActionWithDependencies(args, {
    loadAvailability: (userIds) =>
      sendTRPCMessage({
        subdomain: args.subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'availability',
        input: { userIds },
        defaultValue: [],
      }),
    // Atomic, so two runs at once never take the same turn.
    nextTurn: async (key) => {
      const turn = await models.PickTurns.findOneAndUpdate(
        { _id: key },
        { $inc: { turn: 1 } },
        { upsert: true, new: true },
      ).lean();

      return turn?.turn || 1;
    },
    random: Math.random,
  });
};
