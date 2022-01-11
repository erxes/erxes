export interface ISkillType {
  name: string;
}

export interface ISkillTypesDocument extends ISkillType {
  _id: string;
}

export interface ISkillDocument extends ISkill {
  _id: string;
}

export interface ISkill {
  name: string;
  typeId: string;
  memberIds: string[];
}
