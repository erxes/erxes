import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type BMSLocation {
    lat: Float
    lng: Float
    name: String
    mapId: String
  }
  input BMSLocationInput {
    lat: Float
    lng: Float
    name: String
    mapId: String
  }

  input BmsElementTranslationInput {
    objectId: String 
    language: String!
    name: String
    note: String
    cost: Float
  }

  type ElementTranslation {      
    _id: String!
    objectId: String!
    language: String!
    name: String
    note: String
    cost: Float
    createdAt: Date
    updatedAt: Date
  }

  type Element {
    _id: String!
    name: String
    quick: Boolean
    orderCheck: Boolean
    visibleName: Boolean
    icon: String
    content: String
    note: String
    startTime: String
    duration: Int
    cost: Float
    images: [String]
    categories: [String]
    categoriesObject: [ElementCategory]
    itineraryId: String
    location: BMSLocation
    branchId: String
    language: String
    createdAt: Date
    modifiedAt: Date
    additionalInfo: JSON
    translations: [ElementTranslation] 
  }

  type ElementCategory {
    _id: String!
    name: String
    parentId: String
  }

  type ElementListResponse {
    list: [Element]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  bmsElements(
    branchId: String
    categories: [String]
    name: String
    quick: Boolean
    language: String
    ${GQL_CURSOR_PARAM_DEFS}
  ): ElementListResponse

  bmsElementDetail(_id: String!, language: String): Element

  bmsElementCategories(parentId: String): [ElementCategory]
  bmsElementsInit: JSON
  bmsCategoryInit: JSON
`;

const elementParams = `
  name: String
  content: String
  note: String
  startTime: String
  duration: Int
  cost: Float
  images: [String]
  categories: [String]
  itineraryId: String
  location: BMSLocationInput
  quick: Boolean
  orderCheck: Boolean
  branchId: String
  language: String
  icon: String
  visibleName: Boolean
  additionalInfo: JSON
  translations: [BmsElementTranslationInput]
`;

export const mutations = `
  bmsElementAdd(${elementParams}): Element
  bmsElementRemove(ids: [String]): JSON
  bmsElementEdit(_id: String!, ${elementParams}): Element

  bmsElementCategoryAdd(name: String, parentId: String): ElementCategory
  bmsElementCategoryRemove(_id: String!): JSON
  bmsElementCategoryEdit(_id: String!, name: String, parentId: String): ElementCategory

  bmsElementTranslationUpsert(input: BmsElementTranslationInput!): ElementTranslation
  bmsElementTranslationDelete(_id: String!): JSON
`;
