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
  skillTypes: [SkillType]
  skillTypesTotalCount: Int

  skill(_id: String!): Skill
  skills(typeId: String, page: Int, perPage: Int): [Skill]
  skillsTotalCount(typeId: String): Int
`;

export const mutations = `
  createSkillType(name: String!): SkillType
  updateSkillType(_id: String!, name: String): JSON
  removeSkillType(_id: String!): JSON

  createSkill(name: String!, typeId: String!, memberIds: [String]): Skill
  updateSkill(_id: String!, name: String, memberIds: [String]): Skill
  removeSkill(_id: String!): JSON
`;
