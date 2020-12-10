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
  skillTypes(page: Int, perPage: Int): [SkillType]
  skillTypesTotalCount: Int

  getSkill(_id: String!): Skill
  getSkills(typeId: String!): [Skill]
`;

export const mutations = `
  createSkillType(name: String!): SkillType
  updateSkillType(_id: String!, name: String): JSON
  removeSkillType(_id: String!): JSON

  createSkill(name: String!, typeId: String!, memberIds: [String]): Skill
  updateSkill(_id: String!, name: String, memberIds: [String]): Skill
  removeSkill(_id: String!): JSON
`;
