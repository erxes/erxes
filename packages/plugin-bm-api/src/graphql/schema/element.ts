import gql from 'graphql-tag';

export const types = () => `

  type BMSLocation {
    lat: String
    lng: String
    name: String
  }
  input BMSLocationInput {
    lat: String
    lng: String
    name: String
  }


  type Element {
    _id: String!
    name: String
    content: String
    startTime: String
    duration: Int
    cost: Float
    images: [String]
    categories: [String]
    itineraryId: String!
    location: BMSLocation

    createdAt: Date
    modifiedAt: Date
  }

  type ElementCategory {
    _id: String!
    name: String
    parentId: String
  }
`;

export const queries = `
  bmElements(categories: [String], page:Int, perPage:Int): [Element]
  bmElementCategoryies(parentId:String): [ElementCategory]
`;

const params = `
  name: String,
  content: String,
  startTime: String,
  duration: Int,
  cost:Float,
  images:[String],
  categories: [String],
  itineraryId: String,
  location: BMSLocationInput
`;

export const mutations = `
  bmElementAdd(${params}): Element
  bmElementRemove(_id: String!): JSON
  bmElmentEdit(_id:String!, ${params}): Element
  bmElementCategoryAdd(name:String,parentId:String):ElementCategory
  bmElementCategoryRemove(_id: String!):JSON
  bmElementCategoryEdit(_id: String!, name:String,parentId:String): ElementCategory
`;
