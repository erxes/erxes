import { Model, model } from 'mongoose';
import {
  ISkillDocument,
  ISkillTypeDocument,
  skillSchema,
  skillTypeSchema
} from './definitions/skills';

export interface ISkillTypeModel extends Model<ISkillTypeDocument> {
  getSkilltypes(): Promise<ISkillTypeDocument[]>;
  createSkillType(name: string): Promise<ISkillTypeDocument>;
  updateSkillType(_id: string, name: string): Promise<ISkillTypeDocument>;
  removeSkillType(_id: string): Promise<void>;
}

export const loadSkillTypeClass = () => {
  class SkillType {
    public static async getSkilltypes() {
      const skilltypes = await SkillTypes.find({});

      if (!skilltypes) {
        throw new Error('Skill types not found');
      }

      return skilltypes;
    }

    public static async createSkillType(name: string) {
      return SkillTypes.create({ name });
    }

    public static async updateSkillType(_id: string, name: string) {
      return SkillTypes.updateOne({ _id }, { $set: { name } });
    }

    public static async removeSkillType(_id: string) {
      // TODO - Force remove related skills?

      await Skills.remove({ typeId: _id });

      return SkillTypes.remove({ _id });
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

interface ISkillUpdateParam extends Omit<ISkillParams, 'typeId'> {
  _id: string;
}

export interface ISkillModel extends Model<ISkillDocument> {
  getSkill(_id: string): Promise<ISkillDocument>;
  getSkills(typeId: string): Promise<ISkillDocument[]>;
  createSkill({
    name,
    typeId,
    memberIds
  }: ISkillParams): Promise<ISkillDocument>;
  updateSkill({
    _id,
    name,
    memberIds
  }: ISkillUpdateParam): Promise<ISkillDocument>;
  removeSkill(_id: string): Promise<void>;
}

export const loadSkillClass = () => {
  class Skill {
    public static async getSkills(typeId: string) {
      const skills = await Skills.find({ typeId });

      if (!skills) {
        throw new Error('Skills not found');
      }

      return skills;
    }

    public static async createSkill(doc: ISkillParams) {
      return Skills.create(doc);
    }

    public static async updateSkill({
      _id,
      memberIds,
      name
    }: ISkillUpdateParam) {
      return Skills.updateOne({ _id }, { $set: { memberIds, name } });
    }

    public static async removeSkill(_id: string) {
      return Skills.remove({ _id });
    }
  }

  skillSchema.loadClass(Skill);

  return skillTypeSchema;
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
