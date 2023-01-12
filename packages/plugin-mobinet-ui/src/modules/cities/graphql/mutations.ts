const fields = `
  $code: String!
  $name: String!
  $center: JSON
  $iso: String
  $stat: String
`;

const variables = `
  code: $code
  name: $name
  center: $center
  iso: $iso
  stat: $stat
`;

const citiesAddMutation = `
  mutation CitiesAdd(
    ${fields}
  ) {
    citiesAdd(
      ${variables}
    ) {
      _id
    }
  }
`;

const citiesEditMutation = `
  mutation CitiesEdit(
    $_id: String!
    ${fields}
  ) {
    citiesEdit(
      _id: $_id
      ${variables}
    ) {
      _id
    }
  }
`;

const citiesRemoveMutation = `
  mutation CitiesRemove($_ids: [String]) {
    citiesRemove(_ids: $_ids)
  }
`;

export default {
  citiesAddMutation,
  citiesEditMutation,
  citiesRemoveMutation
};
