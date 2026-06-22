import type {
  IMastraAgentSkill,
  IMastraAgentSkillIndexEntry,
} from '@/skill/@types/skill';

// Scope + fingerprint logic for agent skills, kept pure (no DB, no Mongoose) so
// it can be unit-tested against the spec directly and reused by both the model
// layer (the Mongo filter) and the runtime (in-memory availability checks).

/**
 * The Mongo filter selecting the skills one agent may see: enabled, and either
 * global (no `agentIds` / empty list) or explicitly scoped to this agent.
 *
 * A skill with an empty `agentIds` is a GLOBAL playbook — available to every
 * agent. A non-empty list scopes it to exactly those agents.
 */
export function skillAgentFilter(agentId: string): Record<string, unknown> {
  return {
    isEnabled: { $ne: false },
    $or: [
      { agentIds: { $exists: false } },
      { agentIds: { $size: 0 } },
      { agentIds: agentId },
    ],
  };
}

/** In-memory mirror of {@link skillAgentFilter} — same rule, for a loaded doc. */
export function isSkillAvailableToAgent(
  skill: Pick<IMastraAgentSkill, 'isEnabled' | 'agentIds'>,
  agentId: string,
): boolean {
  if (skill.isEnabled === false) return false;
  const scope = skill.agentIds;
  if (!scope || scope.length === 0) return true; // global playbook
  return scope.includes(agentId);
}

/**
 * Normalise a skill name to a stable kebab-case slug. The agent loads a skill
 * by the exact name shown in its prompt index, so the stored name and the
 * displayed name must be one and the same — normalising on save guarantees it.
 */
export function normalizeSkillName(raw: string): string {
  return (raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * A fingerprint of the skill INDEX for an agent — it changes whenever a skill
 * is added, removed, renamed, re-described, or otherwise edited (`updatedAt`),
 * and is independent of ordering. The agent cache keys on it so a freshly
 * taught (or edited) skill takes effect on the very next turn, exactly like the
 * installed-services inventory fingerprint already does for operations.
 *
 * It deliberately does NOT depend on the skill `body`: the body is fetched live
 * by load_skill on every use, so a body-only edit needs no agent rebuild.
 */
export function skillsFingerprint(
  skills: Array<
    Pick<IMastraAgentSkillIndexEntry, 'name' | 'description' | 'updatedAt'>
  >,
): string {
  if (!skills.length) return 'none';
  return skills
    .map(
      (skill) =>
        `${skill.name}@${
          skill.updatedAt ? new Date(skill.updatedAt).getTime() : 0
        }`,
    )
    .sort()
    .join('|');
}
