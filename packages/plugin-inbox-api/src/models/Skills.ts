import { Model, model } from 'mongoose';
import {
  ISkillDocument,
  ISkillTypeDocument,
  skillSchema,
  skillTypeSchema
} from './definitions/skills';
import Integrations from './Integrations';

export interface ISkillTypeModel extends Model<ISkillTypeDocument> {
  createSkillType(name: string): Promise<ISkillTypeDocument>;
  updateSkillType(_id: string, name: string): Promise<ISkillTypeDocument>;
  removeSkillType(_id: string): Promise<void>;
}

export const loadSkillTypeClass = () => {
  class SkillType {
    public static async createSkillType(name: string) {
      return SkillTypes.create({ name });
    }

    public static async updateSkillType(_id: string, name: string) {
      return SkillTypes.updateOne({ _id }, { $set: { name } });
    }

    public static async removeSkillType(_id: string) {
      const integrationIds = await Integrations.find({
        'messengerData.skillData.typeId': _id
      }).distinct('_id');

      await Integrations.updateMany(
        { _id: { $in: integrationIds } },
        { $unset: { 'messengerData.skillData': '' } }
      );

      await Skills.deleteMany({ typeId: _id });
      return SkillTypes.deleteOne({ _id });
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

export const loadSkillClass = () => {
  class Skill {
    public static async createSkill(doc: ISkillParams) {
      return Skills.create(doc);
    }

    public static async excludeUserSkill(_id: string, memberIds: string[]) {
      return Skills.updateOne(
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
      return Skills.updateOne({ _id }, { $set: { typeId, memberIds, name } });
    }

    public static async removeSkill(_id: string) {
      const integrationIds = await Integrations.find({
        'messengerData.skillData.options': {
          $elemMatch: { skillId: _id }
        }
      }).distinct('_id');

      await Integrations.updateMany(
        { _id: { $in: integrationIds } },
        { $pull: { 'messengerData.skillData.options': { skillId: _id } } }
      );

      await Skills.deleteOne({ _id });

      return _id;
    }
  }

  skillSchema.loadClass(Skill);

  return skillSchema;
};

loadSkillClass();
loadSkillTypeClass();

// tslint:disable-next-line
const SkillTypes = model<ISkillTypeDocument, ISkillTypeModel>(
  'skill_types',
  skillTypeSchema
);
const Skills = model<ISkillDocument, ISkillModel>('skills', skillSchema);

export { SkillTypes, Skills };