export const types = `
  type SkillType {
    _id: String!
    name: String!
  }

  type Skill {
    _id: String!
    name: String!
    typeId: String!
    memberIds: [String]
  }
`;

export const queries = `
  getSkillTypes: [SkillType]

  getSkill(_id: String!): Skill
  getSkills(typeId: String!): [Skill]
`;

export const mutations = `
  createSkillType(name: String!): SkillType
  updateSkillType(_id: String!, name: String!): SkillType
  removeSkillType(_id: String!): JSON

  createSkill(name: String!, typeId: String!, memberIds: [String]): Skill
  updateSkill(_id: String!, name: String, memberIds: [String]): Skill
  removeSkill(_id: String!): JSON
`;
