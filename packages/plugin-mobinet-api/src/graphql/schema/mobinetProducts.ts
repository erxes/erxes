export const types = `
  type MobinetServices {
    hbbServices: [Product]
    vooServices: [Product]
  }

  type MobinetProducts {
    hbbProducts: [Product]
    vooProducts: [Product]
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
mobinetServices(${qryParams},districtId:String!, buildingId: String!, voo: Boolean, hbb: Boolean): MobinetServices
mobinetProducts(${qryParams},districtId:String!, buildingId: String!, voo: Boolean, hbb: Boolean): MobinetProducts
`;
