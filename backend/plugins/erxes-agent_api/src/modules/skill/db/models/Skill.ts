import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { agentSkillSchema } from '@/skill/db/definitions/skill';
import {
  IMastraAgentSkill,
  IMastraAgentSkillDocument,
  IMastraAgentSkillIndexEntry,
} from '@/skill/@types/skill';
import {
  isSkillAvailableToAgent,
  normalizeSkillName,
  skillAgentFilter,
} from '@/skill/skillScope';

const INDEX_PROJECTION = { name: 1, title: 1, description: 1, updatedAt: 1 };

export interface IMastraAgentSkillModel
  extends Model<IMastraAgentSkillDocument> {
  getSkill(_id: string): Promise<IMastraAgentSkillDocument>;
  listSkills(agentId?: string): Promise<IMastraAgentSkillDocument[]>;
  // The lean always-loaded index (no body) for one agent's prompt.
  listIndexForAgent(agentId: string): Promise<IMastraAgentSkillIndexEntry[]>;
  // The full playbook for one agent, resolved on demand by load_skill.
  findForAgentByName(
    agentId: string,
    name: string,
  ): Promise<IMastraAgentSkillDocument | null>;
  createSkill(
    doc: IMastraAgentSkill,
    userId?: string,
  ): Promise<IMastraAgentSkillDocument>;
  updateSkill(
    _id: string,
    doc: Partial<IMastraAgentSkill>,
  ): Promise<IMastraAgentSkillDocument>;
  removeSkill(_id: string): Promise<{ deletedCount?: number }>;
  recordSkillUse(_id: string): Promise<void>;
}

export const loadAgentSkillClass = (models: IModels) => {
  /** Validate + normalise a skill name, guarding against blanks/duplicates. */
  const prepareName = async (
    raw: string | undefined,
    ignoreId?: string,
  ): Promise<string> => {
    const name = normalizeSkillName(raw ?? '');
    if (!name) {
      throw new ExpectedError(
        'Skill name is required (letters, numbers and dashes).',
      );
    }
    const clash = await models.MastraAgentSkill.findOne({ name });
    if (clash && clash._id !== ignoreId) {
      throw new ExpectedError(`A skill named "${name}" already exists.`);
    }
    return name;
  };

  class MastraAgentSkill {
    public static async getSkill(_id: string) {
      const skill = await models.MastraAgentSkill.findOne({ _id });
      if (!skill) throw new ExpectedError('Skill not found');
      return skill;
    }

    // Management listing: every skill (optionally those one agent can see).
    public static async listSkills(agentId?: string) {
      const filter = agentId ? skillAgentFilter(agentId) : {};
      return models.MastraAgentSkill.find(filter).sort({ name: 1 });
    }

    public static async listIndexForAgent(agentId: string) {
      return models.MastraAgentSkill.find(
        skillAgentFilter(agentId),
        INDEX_PROJECTION,
      )
        .sort({ name: 1 })
        .lean();
    }

    // The security-sensitive path: one agent loading one playbook by name. The
    // pure `isSkillAvailableToAgent` predicate is the authoritative enabled +
    // scope check here (it must agree with `skillAgentFilter` used for bulk
    // listing) so an agent can never load another agent's private or disabled
    // skill — and that rule is unit-testable without a database.
    public static async findForAgentByName(agentId: string, name: string) {
      const skill = await models.MastraAgentSkill.findOne({
        name: normalizeSkillName(name),
      });
      if (!skill || !isSkillAvailableToAgent(skill, agentId)) return null;
      return skill;
    }

    public static async createSkill(doc: IMastraAgentSkill, userId?: string) {
      const name = await prepareName(doc.name);
      return models.MastraAgentSkill.create({
        ...doc,
        name,
        ...(userId ? { createdByUserId: userId } : {}),
      });
    }

    public static async updateSkill(
      _id: string,
      doc: Partial<IMastraAgentSkill>,
    ) {
      const existing = await models.MastraAgentSkill.getSkill(_id);
      const update: Partial<IMastraAgentSkill> = { ...doc };
      if (doc.name !== undefined) {
        update.name = await prepareName(doc.name, _id);
      }
      await models.MastraAgentSkill.updateOne({ _id }, { $set: update });
      return models.MastraAgentSkill.getSkill(existing._id);
    }

    public static async removeSkill(_id: string) {
      await models.MastraAgentSkill.getSkill(_id);
      return models.MastraAgentSkill.deleteOne({ _id });
    }

    // Best-effort usage telemetry — never blocks or fails a load_skill call.
    public static async recordSkillUse(_id: string) {
      try {
        await models.MastraAgentSkill.updateOne(
          { _id },
          { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
        );
      } catch {
        /* telemetry is non-critical */
      }
    }
  }

  agentSkillSchema.loadClass(MastraAgentSkill);
  return agentSkillSchema;
};
