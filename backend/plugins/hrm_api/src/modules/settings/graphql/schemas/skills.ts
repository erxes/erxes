export const types = `
  type HrmSkill {
    _id: String!
    code: String!
    name: String!
    description: String
    category: String
    score: Float
    status: String!
    createdAt: Date
    updatedAt: Date
  }
`;

export const inputs = `
  input HrmSkillInput {
    code: String!
    name: String!
    description: String
    category: String
    score: Float
    status: String
  }
`;

export const queries = `
  hrmSkillDetail(_id: String!): HrmSkill
  hrmSkillByCode(code: String!): HrmSkill
  hrmSkills(status: String, category: String, searchValue: String, page: Int, perPage: Int): [HrmSkill]
  hrmSkillsCount(status: String, category: String, searchValue: String): Int
`;

export const mutations = `
  hrmSkillsCreate(doc: HrmSkillInput!): HrmSkill
  hrmSkillsUpdate(_id: String!, doc: HrmSkillInput!): HrmSkill
  hrmSkillsArchive(_id: String!): HrmSkill
  hrmSkillsRemove(_id: String!): String
`;
