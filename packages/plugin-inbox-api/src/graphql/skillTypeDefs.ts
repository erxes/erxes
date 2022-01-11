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
  skills(typeId: String, page: Int, perPage: Int, memberIds: [String], list: Boolean): [Skill]
  skillsTotalCount(typeId: String): Int
`;

export const mutations = `
  createSkillType(name: String!): SkillType
  updateSkillType(_id: String!, name: String): JSON
  removeSkillType(_id: String!): JSON

  createSkill(name: String!, typeId: String!, memberIds: [String]): JSON
  updateSkill(_id: String!, typeId: String, name: String, memberIds: [String], exclude: Boolean): JSON
  excludeUserSkill(_id: String!, memberIds: [String]!): JSON
  addUserSkills(memberId: String!, skillIds: [String]!): JSON
  removeSkill(_id: String!): JSON
`;