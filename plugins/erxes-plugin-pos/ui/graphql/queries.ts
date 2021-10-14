const posList = `
  query posList {
    allPos {
      _id
      name
      description
    }
  }
`;

const configs = `
  query posConfigs($posId: String!) {
    posConfigs(posId: $posId) {
      _id
      posId
      code
      value
    }
  }
`

const productGroups = `
  query productGroups($posId: String!) {
    productGroups(posId: $posId) {
      _id
      posId
      name
      description
      categoryIds
      excludeCategoryIds
      excludeProductIds
    }
  }
`

export default {
  posList,
  configs,
  productGroups
};
