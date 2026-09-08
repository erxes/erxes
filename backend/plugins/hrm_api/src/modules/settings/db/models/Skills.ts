import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ISkill, ISkillDocument } from '../../@types/skill';
import { skillSchema } from '../definitions/skill';

export type SkillInput = Omit<ISkill, 'createdAt' | 'updatedAt'>;

export type SkillListParams = {
  status?: string;
  category?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
};

export interface ISkillModel extends Model<ISkillDocument> {
  getSkill(_id: string): Promise<ISkillDocument>;
  getSkillByCode(code: string): Promise<ISkillDocument | null>;
  createSkill(doc: SkillInput): Promise<ISkillDocument>;
  updateSkill(
    _id: string,
    doc: Partial<SkillInput>,
  ): Promise<ISkillDocument | null>;
  archiveSkill(_id: string): Promise<ISkillDocument | null>;
  removeSkill(_id: string): Promise<string>;
}

const buildSelector = ({
  status,
  category,
  searchValue,
}: SkillListParams): FilterQuery<ISkillDocument> => {
  const selector: FilterQuery<ISkillDocument> = {};

  if (status) {
    selector.status = status;
  }

  if (category) {
    selector.category = category;
  }

  if (searchValue) {
    selector.$or = [
      { code: { $regex: searchValue, $options: 'i' } },
      { name: { $regex: searchValue, $options: 'i' } },
      { category: { $regex: searchValue, $options: 'i' } },
    ];
  }

  return selector;
};

export const skillSelector = buildSelector;

export const loadSkillClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class SkillClass {
    public static async getSkill(_id: string) {
      const skill = await models.Skills.findOne({ _id }).lean();

      if (!skill) {
        throw new Error('Skill not found');
      }

      return skill;
    }

    public static async getSkillByCode(code: string) {
      return models.Skills.findOne({ code }).lean();
    }

    public static async createSkill(doc: SkillInput) {
      const now = new Date();
      const created = await models.Skills.create({
        ...doc,
        createdAt: now,
        updatedAt: now,
      });

      sendDbEventLog({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateSkill(_id: string, doc: Partial<SkillInput>) {
      const oldSkill = await models.Skills.getSkill(_id);

      await models.Skills.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      const updated = await models.Skills.findOne({ _id });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updated?.toObject(),
        prevDocument: oldSkill,
      });

      return updated;
    }

    public static async archiveSkill(_id: string) {
      return models.Skills.updateSkill(_id, { status: 'archived' });
    }

    public static async removeSkill(_id: string) {
      const oldSkill = await models.Skills.getSkill(_id);

      await models.Skills.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldSkill._id,
      });

      return 'success';
    }
  }

  skillSchema.loadClass(SkillClass);

  return skillSchema;
};
