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
    createdAt: Date
    modifiedAt: Date
    additionalInfo: JSON
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
  bmsElements(branchId:String, categories: [String],name: String,quick: Boolean, ${GQL_CURSOR_PARAM_DEFS}): ElementListResponse
  bmsElementDetail(_id:String!): Element
  bmsElementCategories(parentId:String): [ElementCategory]
  bmsElementsInit: JSON
  bmsCategoryInit: JSON
`;

const params = `
  name: String,
  content: String,
  note: String,
  startTime: String,
  duration: Int,
  cost:Float,
  images:[String],
  categories: [String],
  itineraryId: String,
  location: BMSLocationInput,
  quick: Boolean,
  orderCheck: Boolean,
  branchId: String,
  icon: String,
  visibleName: Boolean,
  additionalInfo: JSON
`;

export const mutations = `
  bmsElementAdd(${params}): Element
  bmsElementRemove(ids: [String]): JSON
  bmsElementEdit(_id:String!, ${params}): Element
  bmsElementCategoryAdd(name:String,parentId:String):ElementCategory
  bmsElementCategoryRemove(_id: String!):JSON
  bmsElementCategoryEdit(_id: String!, name:String,parentId:String): ElementCategory
`;
