export const types = `
  type Place @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    province: String
    name: String
    code: String
    center: JSON
  }

  type PlaceListResponse {
    list: [Place],
    totalCount: Int
  }

  type DealPlace {
    dealId: String,
    startPlaceId: String,
    endPlaceId: String

    startPlace: Place
    endPlace: Place
  }
`;

export const queries = `
    places(searchValue: String, page: Int, perPage: Int): PlaceListResponse
    getDealPlace(dealId: String!): DealPlace
    placeDetail(_id: String!): Place
`;

const params = `
    province: String!
    name: String!
    code: String!
    center: JSON!
`;

export const mutations = `
    placesAdd(${params}): Place
    placesEdit(_id: String!, ${params}): Place
    placesRemove(_id: String!): JSON

    setDealPlace(dealId: String!, startPlaceId: String, endPlaceId: String): DealPlace
`;
