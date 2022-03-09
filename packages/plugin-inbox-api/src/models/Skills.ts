import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ISkillDocument,
  ISkillTypeDocument,
  skillSchema,
  skillTypeSchema
} from './definitions/skills';

export interface ISkillTypeModel extends Model<ISkillTypeDocument> {
  createSkillType(name: string): Promise<ISkillTypeDocument>;
  updateSkillType(_id: string, name: string): Promise<ISkillTypeDocument>;
  removeSkillType(_id: string): Promise<void>;
}

export const loadSkillTypeClass = (models: IModels) => {
  class SkillType {
    public static async createSkillType(name: string) {
      return models.SkillTypes.create({ name });
    }

    public static async updateSkillType(_id: string, name: string) {
      return models.SkillTypes.updateOne({ _id }, { $set: { name } });
    }

    public static async removeSkillType(_id: string) {
      const integrationIds = await models.Integrations.find({
        'messengerData.skillData.typeId': _id
      }).distinct('_id');

      await models.Integrations.updateMany(
        { _id: { $in: integrationIds } },
        { $unset: { 'messengerData.skillData': '' } }
      );

      await models.Skills.deleteMany({ typeId: _id });
      return models.SkillTypes.deleteOne({ _id });
    }
  }

  skillTypeSchema.loadClass(SkillType);

  return skillTypeSchema;
};

interface ISkillParams {
  name: string;
  typeId: string;
  memberIds: string[];
}

interface ISkillUpdateParam extends ISkillParams {
  _id: string;
}

export interface ISkillModel extends Model<ISkillDocument> {
  excludeUserSkill(_id: string, memberIds: string[]): Promise<void>;
  createSkill({ name, typeId, memberIds }: ISkillParams): Promise<void>;
  updateSkill({
    _id,
    name,
    typeId,
    memberIds
  }: ISkillUpdateParam): Promise<void>;
  removeSkill(_id: string): Promise<void>;
}

export const loadSkillClass = (models: IModels) => {
  class Skill {
    public static async createSkill(doc: ISkillParams) {
      return models.Skills.create(doc);
    }

    public static async excludeUserSkill(_id: string, memberIds: string[]) {
      return models.Skills.updateOne(
        { _id },
        { $pull: { memberIds: { $in: memberIds } } }
      );
    }

    public static async updateSkill({
      _id,
      memberIds,
      typeId,
      name
    }: ISkillUpdateParam) {
      return models.Skills.updateOne({ _id }, { $set: { typeId, memberIds, name } });
    }

    public static async removeSkill(_id: string) {
      const integrationIds = await models.Integrations.find({
        'messengerData.skillData.options': {
          $elemMatch: { skillId: _id }
        }
      }).distinct('_id');

      await models.Integrations.updateMany(
        { _id: { $in: integrationIds } },
        { $pull: { 'messengerData.skillData.options': { skillId: _id } } }
      );

      await models.Skills.deleteOne({ _id });

      return _id;
    }
  }

  skillSchema.loadClass(Skill);

  return skillSchema;
};