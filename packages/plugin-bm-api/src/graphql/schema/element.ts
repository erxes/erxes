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
    itineraryId: String
    location: BMSLocation

    createdAt: Date
    modifiedAt: Date
  }

  type ElementCategory {
    _id: String!
    name: String
    parentId: String
  }
  type ListElement {
    list: [Element]
    total: Int
  }
`;

export const queries = `
  bmElements(categories: [String], page:Int, perPage:Int): ListElement
  bmElementDetail(_id:String!): Element
  bmElementCategoryies(parentId:String): [ElementCategory]
  bmElementsInit: JSON
  bmCategoryInit: JSON
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
  bmElementRemove(ids: [String]): JSON
  bmElementEdit(_id:String!, ${params}): Element
  bmElementCategoryAdd(name:String,parentId:String):ElementCategory
  bmElementCategoryRemove(_id: String!):JSON
  bmElementCategoryEdit(_id: String!, name:String,parentId:String): ElementCategory
`;
