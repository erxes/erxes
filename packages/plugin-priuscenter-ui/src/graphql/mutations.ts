const variables = `
  $type: String!
  $title: String!
  $description: String!
  $mark: String
  $model: String
  $color: String
  $manufacturedYear: Int

  $state: String
  $price: Float

  $attachments: [String]
  $location: JSON

  $authorName: String
  $authorPhone: String
  $authorEmail: String
`;

const params = `
  type: $type
  title: $title
  description: $description
  mark: $mark
  model: $model
  color: $color
  manufacturedYear: $manufacturedYear

  state: $state
  price: $price

  attachments: $attachments
  location: $location

  authorName: $authorName
  authorPhone: $authorPhone
  authorEmail: $authorEmail
`;

const add = `
  mutation adsAdd(${variables}) {
    adsAdd(${params}) {
      _id
    }
  }
`;

const remove = `
  mutation adsRemove($_id: String!){
    adsRemove(_id: $_id)
  }
`;

const edit = `
  mutation adsEdit($_id: String!, ${variables}){
    adsEdit(_id: $_id, ${params}){
      _id
    }
  }
`;

export default {
  add,
  remove,
  edit
};
