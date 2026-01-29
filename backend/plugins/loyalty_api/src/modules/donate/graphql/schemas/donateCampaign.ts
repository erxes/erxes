export const types = `
  type DonateCampaign {
    _id: String
    name: String
    description: String
    status: String

    maxScore: Float
    awards: JSON

    createdAt: String
    updatedAt: String
    createdBy: String
    updatedBy: String

    donatesCount: Int
  }
`;
const queryParams = `
  status: String
  searchValue: String
`;
export const queries = `
  getDonateCampaigns(${queryParams}): [DonateCampaign]
  getDonateCampaignDetail(_id: String!): DonateCampaign
`;
const mutationParams = `
  name: String
  description: String
  status: String

  maxScore: Float
  awards: JSON
`;
export const mutations = `
  createDonateCampaign(${mutationParams}): DonateCampaign
  updateDonateCampaign(_id: String!, ${mutationParams}): DonateCampaign
  removeDonateCampaign(_id: String!): DonateCampaign
`;
