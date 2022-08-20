import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type Neighbor  @key(fields: "_id"){
    _id: String!
    productCategoryId: String
    data: JSON
    info: JSON
    rate: JSON
  }

  input NeighborInput {
    productCategoryId: String
    data: JSON
    rate: JSON
  }

  input LocationInput{
    type: String
    coordinates: [Float]
  }


  input ageGroupsInput{
    genz: Float,
    millennials:Float,
    genx: Float,
    boomers: Float,
  }

  input sexInput{
    male: Float,
    female: Float
  }

  input SchoolInput {
    description: String
    district: String
    khoroo: String
    locationValue: LocationInput
  }

  input UniversityInput{
    description: String
    locationValue: LocationInput
  }

  input SohInput{
    thermality: String
    electricity: String
    security: String
    cable: String
  }

  input KhorooInput{
    distance: String
    khorooNumber: String
    address: String
    phoneNumber: String
    hospital: String
    locationValue: LocationInput,
    ageGroup: ageGroupsInput,
    sex: sexInput,
    aptHouseholder: Float
  }

  input EnvInfoInput{
    camera: Float
    walkingEnv: Float
    basketball: Float
    playground: Float
    greenPlant: Float
    streetLighting: Float
  }

  input CommonInput{
    district: String
    khoroo: String
    locationValue: LocationInput
  }

  input DistrictTownInput{
    averagePrice: String
    averageM2: Float
    population: Float
    averageAge: Float
    publicService: String
    featuredAds: String
    market: String
    publicServiceAttachment: [JSON]
    featuredAdsAttachment: [JSON]
    marketAttachment: [JSON]
    districtProfile: String
    districtProfileAttachment: [JSON]
  }

`;

const neighborParams = `
  productCategoryId: String
  data: JSON
  rate: JSON
`;

const neighborItemParams = `
  _id: String
  name: String
  type: String
  createdAt: Date
  createdBy: String
  schoolData: SchoolInput
  kindergardenData: SchoolInput
  universityData: UniversityInput
  sohData: SohInput
  khorooData: KhorooInput
  envInfoData: EnvInfoInput
  busStopData: CommonInput
  parkingData: CommonInput
  hospitalData: CommonInput
  pharmacyData: CommonInput
  districtTownData: DistrictTownInput
`;

export const queries = `
  getNeighborItems(type:String): JSON
  getNeighborItem(_id:String): JSON
  getNeighbor(productCategoryId: String!): Neighbor
`;

export const mutations = `
  neighborSave(${neighborParams}): Neighbor
  neighborRemove(${neighborParams}): Neighbor
  neighborItemCreate(${neighborItemParams}): JSON
  neighborItemEdit(${neighborItemParams}): JSON
  neighborItemRemove(_id:String): JSON
`;
