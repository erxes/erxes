export const types = `
    type MobinetService {
        fttb: [Product]
        ftth: [Product]
    }

  type MobinetProductListResponse {
    hbbServices: MobinetService
    vooServices: [Product]
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    code: String!
    iso: String
    stat: String
    center: JSON
`;

export const mutations = `

`;

const qryParams = `
    searchValue: String
    page: Int
    perPage: Int
`;

export const queries = `
mobinetServices(${qryParams}, districtId: String!, voo: Boolean, hbb: Boolean): MobinetProductListResponse
`;
